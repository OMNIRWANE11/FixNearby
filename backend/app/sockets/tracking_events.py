from flask import request
from flask_socketio import join_room, leave_room, emit
from app.extensions import socketio, db
from app.models.emergency_request import EmergencyRequest
from app.models.technician import Technician
from app.models.location_log import LocationLog
from app.services.tracking_simulator import start_tracking_simulation, stop_tracking_simulation
from app.services.geo_service import haversine_distance_km, estimate_eta_minutes
from datetime import datetime

def register_socket_events(socketio_instance):
    @socketio_instance.on("connect")
    def handle_connect():
        pass

    @socketio_instance.on("disconnect")
    def handle_disconnect():
        pass

    @socketio_instance.on("join_request_room")
    def handle_join_request_room(data):
        """Customer or Technician joins the specific request room"""
        request_id = data.get("requestId")
        if not request_id:
            return
        join_room(request_id)
        emit("room_joined", {
            "requestId": request_id,
            "status": "connected",
            "message": f"Connected to live updates for request {request_id}"
        })

    @socketio_instance.on("leave_request_room")
    def handle_leave_request_room(data):
        request_id = data.get("requestId")
        if request_id:
            leave_room(request_id)

    @socketio_instance.on("start_simulation")
    def handle_start_simulation(data):
        request_id = data.get("requestId")
        if request_id:
            start_tracking_simulation(request_id)
            emit("simulation_started", {"requestId": request_id}, room=request_id)

    @socketio_instance.on("stop_simulation")
    def handle_stop_simulation(data):
        request_id = data.get("requestId")
        if request_id:
            stop_tracking_simulation(request_id)
            emit("simulation_stopped", {"requestId": request_id}, room=request_id)

    @socketio_instance.on("technician_location_update")
    def handle_technician_location_update(data):
        """Real-time provider GPS broadcast"""
        request_id = data.get("requestId")
        technician_id = data.get("technicianId")
        lat = data.get("latitude")
        lng = data.get("longitude")

        if not (request_id and technician_id and lat is not None and lng is not None):
            return

        lat = float(lat)
        lng = float(lng)

        req = EmergencyRequest.query.get(request_id)
        if req:
            dist = haversine_distance_km(lat, lng, req.customer_latitude, req.customer_longitude)
            eta = estimate_eta_minutes(dist)
            req.distance_km = round(dist, 2)
            req.estimated_eta_minutes = eta
            db.session.commit()

            # Record location log
            log = LocationLog(
                technician_id=technician_id,
                request_id=request_id,
                latitude=lat,
                longitude=lng,
                speed_kmh=data.get("speedKmh", 0.0),
                heading=data.get("heading", 0.0)
            )
            db.session.add(log)
            db.session.commit()

            payload = {
                "requestId": request_id,
                "technicianId": technician_id,
                "latitude": lat,
                "longitude": lng,
                "distanceRemainingKm": round(dist, 2),
                "etaMinutes": eta,
                "speedKmh": data.get("speedKmh", 0.0),
                "timestamp": datetime.utcnow().isoformat()
            }
            emit("technician_location_update", payload, room=request_id)
            emit("eta_update", {
                "requestId": request_id,
                "etaMinutes": eta,
                "distanceRemainingKm": round(dist, 2)
            }, room=request_id)

