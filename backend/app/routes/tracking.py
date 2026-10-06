import json
from flask import Blueprint
from app.models.emergency_request import EmergencyRequest
from app.models.technician import Technician
from app.services.tracking_simulator import start_tracking_simulation
from app.utils.errors import api_response, api_error

tracking_bp = Blueprint("tracking", __name__)

@tracking_bp.route("/<string:req_id>", methods=["GET"])
def get_tracking_info(req_id):
    req = EmergencyRequest.query.get(req_id)
    if not req:
        return api_error("NOT_FOUND", f"Emergency request '{req_id}' not found.", 404)

    tech_data = None
    if req.assigned_technician:
        tech_data = req.assigned_technician.to_dict(include_credentials=True)

    route_coords = []
    if req.route_polyline:
        try:
            route_coords = json.loads(req.route_polyline)
        except Exception:
            pass

    return api_response({
        "requestId": req.id,
        "status": req.status,
        "severity": req.severity,
        "problem": req.problem_type.name if req.problem_type else req.problem_custom_desc,
        "customerLocation": {
            "latitude": req.customer_latitude,
            "longitude": req.customer_longitude,
            "address": req.customer_address,
            "name": req.customer_name,
            "phone": req.customer_phone
        },
        "technician": tech_data,
        "distanceRemainingKm": req.distance_km,
        "etaMinutes": req.estimated_eta_minutes,
        "routeCoordinates": route_coords,
        "createdAt": req.created_at.isoformat() if req.created_at else None
    })

@tracking_bp.route("/<string:req_id>/simulate", methods=["POST"])
def trigger_simulation(req_id):
    req = EmergencyRequest.query.get(req_id)
    if not req:
        return api_error("NOT_FOUND", "Request not found", 404)

    if not req.assigned_technician_id:
        return api_error("BAD_REQUEST", "Assign a technician before simulating tracking.", 400)

    start_tracking_simulation(req_id)
    return api_response({"status": "Simulation started", "requestId": req_id})

