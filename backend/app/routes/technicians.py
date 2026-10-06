from flask import Blueprint, request
from sqlalchemy import or_
from marshmallow import ValidationError
from app.models.technician import Technician
from app.models.service_category import ServiceCategory
from app.schemas.technician_schema import TechnicianFilterSchema
from app.services.geo_service import haversine_distance_km, estimate_eta_minutes
from app.utils.errors import api_response, api_error

technicians_bp = Blueprint("technicians", __name__)
filter_schema = TechnicianFilterSchema()

@technicians_bp.route("", methods=["GET"])
def list_technicians():
    try:
        filters = filter_schema.load(request.args)
    except ValidationError as err:
        return api_error("VALIDATION_ERROR", "Invalid query parameters", 400, err.messages)

    query = Technician.query

    # Category filter
    if filters.get("categoryId"):
        query = query.filter_by(category_id=filters["categoryId"])
    elif filters.get("category"):
        cat_code = filters["category"].strip().lower()
        cat = ServiceCategory.query.filter(ServiceCategory.code.ilike(cat_code)).first()
        if cat:
            query = query.filter_by(category_id=cat.id)

    # Duty filter
    if filters.get("onDutyOnly"):
        query = query.filter_by(is_on_duty=True)

    # Verified filter
    if filters.get("verifiedOnly"):
        query = query.filter_by(is_verified=True)

    # Rating filter
    if filters.get("minRating") and filters["minRating"] > 0:
        query = query.filter(Technician.rating >= filters["minRating"])

    # Search keyword
    search = filters.get("search")
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.join(Technician.user).filter(
            or_(
                Technician.trade.ilike(search_pattern),
                Technician.badge_code.ilike(search_pattern),
                Technician.specialties.ilike(search_pattern),
                Technician.user.has(full_name=search_pattern)
            )
        )

    all_techs = query.all()

    # User location for distance & sorting
    user_lat = filters.get("lat")
    user_lng = filters.get("lng")
    radius_km = filters.get("radiusKm", 50.0)

    results = []
    for tech in all_techs:
        dist = None
        eta = None
        if user_lat is not None and user_lng is not None:
            dist = haversine_distance_km(user_lat, user_lng, tech.current_latitude, tech.current_longitude)
            if dist > radius_km:
                continue
            eta = estimate_eta_minutes(dist)

        results.append({
            "tech": tech,
            "dist": dist,
            "eta": eta
        })

    # Sort results
    sort_option = filters.get("sort", "nearest")
    if sort_option == "nearest" and user_lat is not None:
        results.sort(key=lambda x: (x["dist"] if x["dist"] is not None else 999999))
    elif sort_option == "rating":
        results.sort(key=lambda x: float(x["tech"].rating), reverse=True)
    elif sort_option == "eta" and user_lat is not None:
        results.sort(key=lambda x: (x["eta"] if x["eta"] is not None else 999999))
    elif sort_option == "experience":
        results.sort(key=lambda x: x["tech"].experience_years, reverse=True)

    serialized = [
        item["tech"].to_dict(distance_km=item["dist"], eta_minutes=item["eta"])
        for item in results
    ]

    return api_response({
        "total": len(serialized),
        "technicians": serialized
    })

@technicians_bp.route("/<string:tech_id>", methods=["GET"])
def get_technician_detail(tech_id):
    tech = Technician.query.get(tech_id)
    if not tech:
        return api_error("NOT_FOUND", f"Technician '{tech_id}' not found.", 404)

    # Check query coordinates for distance
    user_lat = request.args.get("lat", type=float)
    user_lng = request.args.get("lng", type=float)
    dist = None
    eta = None
    if user_lat is not None and user_lng is not None:
        dist = haversine_distance_km(user_lat, user_lng, tech.current_latitude, tech.current_longitude)
        eta = estimate_eta_minutes(dist)

    data = tech.to_dict(include_credentials=True, distance_km=dist, eta_minutes=eta)
    data["reviews"] = [r.to_dict() for r in tech.reviews.order_by(tech.reviews.model.created_at.desc()).limit(10).all()]
    return api_response(data)

