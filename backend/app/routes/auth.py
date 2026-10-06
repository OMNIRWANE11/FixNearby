from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.extensions import db, limiter
from app.models.user import User
from app.models.technician import Technician
from app.models.credential import Credential
from app.schemas.auth_schema import RegisterSchema, LoginSchema, ProfileUpdateSchema
from app.utils.errors import api_response, api_error
from app.utils.badge_generator import generate_unique_badge

auth_bp = Blueprint("auth", __name__)

register_schema = RegisterSchema()
login_schema = LoginSchema()
profile_update_schema = ProfileUpdateSchema()

@auth_bp.route("/register", methods=["POST"])
@limiter.limit("10 per minute")
def register():
    payload = request.get_json() or {}
    try:
        data = register_schema.load(payload)
    except ValidationError as err:
        return api_error("VALIDATION_ERROR", "Invalid registration payload", 400, err.messages)

    # Check if user email already exists
    if User.query.filter_by(email=data["email"].lower().strip()).first():
        return api_error("CONFLICT", "An account with this email address already exists.", 409)

    user = User(
        email=data["email"].lower().strip(),
        full_name=data["fullName"].strip(),
        phone=data["phone"].strip(),
        role=data.get("role", "customer"),
        saved_address=data.get("savedAddress"),
        saved_latitude=data.get("savedLatitude"),
        saved_longitude=data.get("savedLongitude")
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    # If role is technician, initialize technician profile
    if user.role == "technician":
        badge = generate_unique_badge(lambda b: bool(Technician.query.filter_by(badge_code=b).first()))
        tech = Technician(
            user_id=user.id,
            category_id=data.get("categoryId") or 1,
            badge_code=badge,
            trade=data.get("trade") or "General Technician",
            experience_years=data.get("experienceYears", 1),
            phone=user.phone,
            whatsapp_number=user.phone,
            rating=5.0,
            jobs_completed=0,
            operating_radius_km=data.get("operatingRadiusKm", 15.0),
            is_on_duty=False,
            is_verified=False,
            current_latitude=data.get("savedLatitude") or 16.7050,
            current_longitude=data.get("savedLongitude") or 74.2433
        )
        db.session.add(tech)
        db.session.commit()

        # Initialize pending credentials
        cred = Credential(
            technician_id=tech.id,
            legal_name=user.full_name,
            identity_verified=False,
            license_verified=False,
            address_verified=False,
            police_verified=False,
            audit_notes="New registration - verification documents pending review."
        )
        db.session.add(cred)
        db.session.commit()

    access_token = create_access_token(identity=user.id)
    return api_response({
        "token": access_token,
        "user": user.to_dict()
    }, "Registration successful", 201)

@auth_bp.route("/login", methods=["POST"])
@limiter.limit("20 per minute")
def login():
    payload = request.get_json() or {}
    try:
        data = login_schema.load(payload)
    except ValidationError as err:
        return api_error("VALIDATION_ERROR", "Email and password are required", 400, err.messages)

    user = User.query.filter_by(email=data["email"].lower().strip()).first()
    if not user or not user.check_password(data["password"]):
        return api_error("UNAUTHORIZED", "Invalid email address or password.", 401)

    if not user.is_active:
        return api_error("FORBIDDEN", "This account has been deactivated. Please contact support.", 403)

    access_token = create_access_token(identity=user.id)
    user_dict = user.to_dict()
    if user.role == "technician" and user.technician_profile:
        user_dict["technician"] = user.technician_profile.to_dict()

    return api_response({
        "token": access_token,
        "user": user_dict
    }, "Login successful")

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_active:
        return api_error("UNAUTHORIZED", "User not found or inactive.", 401)

    user_dict = user.to_dict()
    if user.role == "technician" and user.technician_profile:
        user_dict["technician"] = user.technician_profile.to_dict(include_credentials=True)

    return api_response(user_dict)

@auth_bp.route("/profile", methods=["PATCH"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return api_error("UNAUTHORIZED", "User not found.", 401)

    payload = request.get_json() or {}
    try:
        data = profile_update_schema.load(payload)
    except ValidationError as err:
        return api_error("VALIDATION_ERROR", "Invalid profile update payload", 400, err.messages)

    if "fullName" in data:
        user.full_name = data["fullName"].strip()
    if "phone" in data:
        user.phone = data["phone"].strip()
    if "savedAddress" in data:
        user.saved_address = data["savedAddress"]
    if "savedLatitude" in data:
        user.saved_latitude = data["savedLatitude"]
    if "savedLongitude" in data:
        user.saved_longitude = data["savedLongitude"]

    db.session.commit()
    return api_response(user.to_dict(), "Profile updated successfully")

