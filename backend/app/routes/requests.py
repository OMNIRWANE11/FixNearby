import json
from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from marshmallow import ValidationError
from app.extensions import db, limiter, socketio
from app.models.emergency_request import EmergencyRequest
from app.models.technician import Technician
from app.models.review import Review
from app.schemas.request_schema import EmergencyRequestCreateSchema, RequestAssignSchema, RequestStatusUpdateSchema
from app.schemas.review_schema import ReviewCreateSchema
from app.services.dispatch_service import DispatchService
from app.services.tracking_simulator import start_tracking_simulation, stop_tracking_simulation
from app.utils.errors import api_response, api_error

requests_bp = Blueprint("requests", __name__)

create_schema = EmergencyRequestCreateSchema()
assign_schema = RequestAssignSchema()
status_schema = RequestStatusUpdateSchema()
review_schema = ReviewCreateSchema()

@requests_bp.route("", methods=["POST"])
@limiter.limit("15 per minute")
def create_emergency_request():
    payload = request.get_json() or {}
    try:
        data = create_schema.load(payload)
    except ValidationError as err:
        return api_error("VALIDATION_ERROR", "Invalid emergency request submission", 400, err.messages)

    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except Exception:
        pass

    try:
        dispatch_result = DispatchService.create_and_dispatch_emergency(data, user_id=user_id)
        return api_response(dispatch_result, "Emergency request registered successfully", 201)
    except Exception as e:
        return api_error("DISPATCH_ERROR", f"Error dispatching emergency: {str(e)}", 500)

@requests_bp.route("/my-requests", methods=["GET"])
def get_user_requests():
    user_id = None
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
    except Exception:
        return api_error("UNAUTHORIZED", "Authentication required to view request history.", 401)

    reqs = EmergencyRequest.query.filter_by(user_id=user_id).order_by(EmergencyRequest.created_at.desc()).all()
    return api_response([r.to_dict() for r in reqs])

@requests_bp.route("/<string:req_id>", methods=["GET"])
def get_request(req_id):
    req = EmergencyRequest.query.get(req_id)
    if not req:
        return api_error("NOT_FOUND", f"Emergency request '{req_id}' not found.", 404)
    return api_response(req.to_dict())

@requests_bp.route("/<string:req_id>/assign", methods=["PATCH"])
def assign_technician(req_id):
    payload = request.get_json() or {}
    try:
        data = assign_schema.load(payload)
    except ValidationError as err:
        return api_error("VALIDATION_ERROR", "Technician ID is required", 400, err.messages)

    try:
        result = DispatchService.assign_technician(req_id, data["technicianId"])
        # Trigger background tracking simulation
        start_tracking_simulation(req_id)

        # Notify room of assignment
        socketio.emit("status_changed", {
            "requestId": req_id,
            "status": "ASSIGNED",
            "message": "Technician has been assigned to your emergency."
        }, room=req_id)

        return api_response(result, "Technician assigned and tracking initiated")
    except ValueError as ve:
        return api_error("BAD_REQUEST", str(ve), 400)
    except Exception as e:
        return api_error("INTERNAL_ERROR", str(e), 500)

@requests_bp.route("/<string:req_id>/status", methods=["PATCH"])
def update_status(req_id):
    req = EmergencyRequest.query.get(req_id)
    if not req:
        return api_error("NOT_FOUND", "Emergency request not found.", 404)

    payload = request.get_json() or {}
    try:
        data = status_schema.load(payload)
    except ValidationError as err:
        return api_error("VALIDATION_ERROR", "Invalid status payload", 400, err.messages)

    old_status = req.status
    req.status = data["status"]

    if data.get("cancellationReason"):
        req.cancellation_reason = data["cancellationReason"]
        stop_tracking_simulation(req_id)

    if req.status == "COMPLETED":
        stop_tracking_simulation(req_id)
        if req.assigned_technician:
            req.assigned_technician.jobs_completed += 1

    db.session.commit()

    socketio.emit("status_changed", {
        "requestId": req_id,
        "oldStatus": old_status,
        "status": req.status,
        "message": f"Status updated to {req.status}"
    }, room=req_id)

    return api_response(req.to_dict(), f"Request status updated to {req.status}")

@requests_bp.route("/<string:req_id>/review", methods=["POST"])
def submit_review(req_id):
    req = EmergencyRequest.query.get(req_id)
    if not req:
        return api_error("NOT_FOUND", "Emergency request not found.", 404)

    if not req.assigned_technician_id:
        return api_error("BAD_REQUEST", "Cannot review a request with no assigned technician.", 400)

    if Review.query.filter_by(request_id=req_id).first():
        return api_error("CONFLICT", "A review for this emergency request has already been submitted.", 409)

    payload = request.get_json() or {}
    try:
        data = review_schema.load(payload)
    except ValidationError as err:
        return api_error("VALIDATION_ERROR", "Invalid review data", 400, err.messages)

    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except Exception:
        pass

    review = Review(
        request_id=req_id,
        technician_id=req.assigned_technician_id,
        user_id=user_id or req.user_id,
        customer_name=req.customer_name,
        rating=data["rating"],
        comment=data.get("comment")
    )
    db.session.add(review)

    # Recalculate technician's average rating
    tech = req.assigned_technician
    all_reviews = Review.query.filter_by(technician_id=tech.id).all()
    all_ratings = [r.rating for r in all_reviews] + [data["rating"]]
    tech.rating = round(sum(all_ratings) / len(all_ratings), 2)

    db.session.commit()

    return api_response(review.to_dict(), "Review submitted successfully", 201)

