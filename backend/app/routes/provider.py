from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.extensions import db, socketio
from app.models.user import User
from app.models.technician import Technician
from app.models.emergency_request import EmergencyRequest
from app.models.location_log import LocationLog
from app.schemas.technician_schema import TechnicianDutySchema, TechnicianLocationUpdateSchema
from app.services.dispatch_service import DispatchService
from app.services.tracking_simulator import start_tracking_simulation
from app.utils.errors import api_response, api_error
from app.utils.security import role_required

provider_bp = Blueprint("provider", __name__)
duty_schema = TechnicianDutySchema()
loc_schema = TechnicianLocationUpdateSchema()

def get_current_technician():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.technician_profile:
        return None
    return user.technician_profile

@provider_bp.route("/duty", methods=["PATCH"])
@jwt_required()
def toggle_duty():
    tech = get_current_technician()
    if not tech:
        return api_error("FORBIDDEN", "Only technicians can toggle duty status.", 403)

    payload = request.get_json() or {}
    try:
        data = duty_schema.load(payload)
    except ValidationError as err:
        return api_error("VALIDATION_ERROR", "Invalid duty payload", 400, err.messages)

    tech.is_on_duty = data["isOnDuty"]
    db.session.commit()

    return api_response({
        "technicianId": tech.id,
        "isOnDuty": tech.is_on_duty,
        "badgeCode": tech.badge_code
    }, f"Duty status changed to {'ONLINE' if tech.is_on_duty else 'OFFLINE'}")

@provider_bp.route("/location", methods=["POST"])
@jwt_required()
def update_location():
    tech = get_current_technician()
    if not tech:
        return api_error("FORBIDDEN", "Technician profile required.", 403)

    payload = request.get_json() or {}
    try:
        data = loc_schema.load(payload)
    except ValidationError as err:
        return api_error("VALIDATION_ERROR", "Invalid location payload", 400, err.messages)

    tech.current_latitude = data["latitude"]
    tech.current_longitude = data["longitude"]

    # Log breadcrumb
    req_id = data.get("requestId")
    log = LocationLog(
        technician_id=tech.id,
        request_id=req_id,
        latitude=data["latitude"],
        longitude=data["longitude"],
        speed_kmh=data.get("speedKmh", 0.0),
        heading=data.get("heading", 0.0)
    )
    db.session.add(log)
    db.session.commit()

    # If associated with active emergency request, broadcast via socketio
    if req_id:
        socketio.emit("technician_location_update", {
            "requestId": req_id,
            "technicianId": tech.id,
            "latitude": tech.current_latitude,
            "longitude": tech.current_longitude,
            "speedKmh": data.get("speedKmh", 0.0)
        }, room=req_id)

    return api_response({
        "latitude": tech.current_latitude,
        "longitude": tech.current_longitude,
        "recorded": True
    })

@provider_bp.route("/requests", methods=["GET"])
@jwt_required()
def get_provider_requests():
    tech = get_current_technician()
    if not tech:
        return api_error("FORBIDDEN", "Technician profile required.", 403)

    # Active requests assigned to this technician
    active_requests = EmergencyRequest.query.filter(
        EmergencyRequest.assigned_technician_id == tech.id,
        EmergencyRequest.status.in_(["ASSIGNED", "ON_THE_WAY", "ARRIVED"])
    ).order_by(EmergencyRequest.created_at.desc()).all()

    # Incoming pending requests in same category
    incoming_pending = EmergencyRequest.query.filter(
        EmergencyRequest.category_id == tech.category_id,
        EmergencyRequest.status == "PENDING"
    ).order_by(EmergencyRequest.created_at.desc()).limit(10).all()

    # Completed history
    completed_history = EmergencyRequest.query.filter(
        EmergencyRequest.assigned_technician_id == tech.id,
        EmergencyRequest.status.in_(["COMPLETED", "CANCELLED"])
    ).order_by(EmergencyRequest.created_at.desc()).limit(15).all()

    return api_response({
        "activeRequests": [r.to_dict() for r in active_requests],
        "incomingPending": [r.to_dict() for r in incoming_pending],
        "completedHistory": [r.to_dict() for r in completed_history]
    })

@provider_bp.route("/requests/<string:req_id>/respond", methods=["PATCH"])
@jwt_required()
def respond_request(req_id):
    tech = get_current_technician()
    if not tech:
        return api_error("FORBIDDEN", "Technician profile required.", 403)

    req = EmergencyRequest.query.get(req_id)
    if not req:
        return api_error("NOT_FOUND", "Request not found.", 404)

    payload = request.get_json() or {}
    action = payload.get("action", "").lower() # accept, decline, on_the_way, arrived, complete

    if action == "accept":
        DispatchService.assign_technician(req_id, tech.id)
        start_tracking_simulation(req_id)
        return api_response(req.to_dict(), "Request accepted and assigned")

    elif action == "on_the_way":
        req.status = "ON_THE_WAY"
        db.session.commit()
        socketio.emit("status_changed", {"requestId": req_id, "status": "ON_THE_WAY"}, room=req_id)
        return api_response(req.to_dict(), "Status updated to ON_THE_WAY")

    elif action == "arrived":
        req.status = "ARRIVED"
        db.session.commit()
        socketio.emit("status_changed", {"requestId": req_id, "status": "ARRIVED"}, room=req_id)
        return api_response(req.to_dict(), "Status updated to ARRIVED")

    elif action == "complete":
        req.status = "COMPLETED"
        tech.jobs_completed += 1
        db.session.commit()
        socketio.emit("status_changed", {"requestId": req_id, "status": "COMPLETED"}, room=req_id)
        return api_response(req.to_dict(), "Request marked as COMPLETED")

    elif action == "decline":
        # If was assigned to this tech, unassign
        if req.assigned_technician_id == tech.id:
            req.assigned_technician_id = None
            req.status = "PENDING"
            db.session.commit()
        return api_response({"status": "declined"}, "Request declined")

    return api_error("BAD_REQUEST", f"Unknown action '{action}'", 400)

