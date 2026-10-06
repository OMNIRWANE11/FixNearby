import time
import threading
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from flask import current_app
from app.extensions import db, socketio
from app.models.emergency_request import EmergencyRequest
from app.models.technician import Technician
from app.models.location_log import LocationLog
from app.services.geo_service import haversine_distance_km, estimate_eta_minutes

# Active simulation threads tracker: { request_id: threading.Event() }
_ACTIVE_SIMULATIONS: Dict[str, threading.Event] = {}
_SIMULATION_LOCK = threading.Lock()

def start_tracking_simulation(request_id: str, app_instance=None):
    """
    Spawns background simulation worker for the given emergency request.
    Interpolates along the route geometry, periodically emitting Socket.IO events.
    """
    with _SIMULATION_LOCK:
        if request_id in _ACTIVE_SIMULATIONS:
            # Already simulating
            return
        stop_event = threading.Event()
        _ACTIVE_SIMULATIONS[request_id] = stop_event

    # We need the Flask app context inside the thread
    from flask import current_app
    app = app_instance or current_app._get_current_object()

    thread = threading.Thread(
        target=_simulation_worker,
        args=(app, request_id, stop_event),
        daemon=True
    )
    thread.start()

def stop_tracking_simulation(request_id: str):
    """Signals simulation for request_id to cleanly terminate"""
    with _SIMULATION_LOCK:
        if request_id in _ACTIVE_SIMULATIONS:
            _ACTIVE_SIMULATIONS[request_id].set()
            del _ACTIVE_SIMULATIONS[request_id]

def _simulation_worker(app, request_id: str, stop_event: threading.Event):
    with app.app_context():
        try:
            req = EmergencyRequest.query.get(request_id)
            if not req or not req.assigned_technician_id:
                return

            tech = Technician.query.get(req.assigned_technician_id)
            if not tech:
                return

            # Extract waypoints from route polyline
            waypoints = []
            if req.route_polyline:
                try:
                    waypoints = json.loads(req.route_polyline)
                except Exception:
                    pass

            if not waypoints or len(waypoints) < 2:
                # Synthesize 10 intermediate points between technician and customer
                steps = 10
                for i in range(steps + 1):
                    r = i / float(steps)
                    lat = tech.current_latitude + (req.customer_latitude - tech.current_latitude) * r
                    lng = tech.current_longitude + (req.customer_longitude - tech.current_longitude) * r
                    waypoints.append([lat, lng])

            # Transition request status to ON_THE_WAY
            req.status = "ON_THE_WAY"
            db.session.commit()

            socketio.emit("status_changed", {
                "requestId": request_id,
                "status": "ON_THE_WAY",
                "message": f"{tech.user.full_name} is on the way to your location."
            }, room=request_id)

            total_points = len(waypoints)
            # Step along the route every 2.5 seconds
            for idx in range(total_points):
                if stop_event.is_set():
                    break

                pt = waypoints[idx]
                curr_lat, curr_lng = float(pt[0]), float(pt[1])

                # Calculate remaining distance to customer
                rem_dist = haversine_distance_km(curr_lat, curr_lng, req.customer_latitude, req.customer_longitude)
                rem_eta = estimate_eta_minutes(rem_dist, avg_speed_kmh=35.0, prep_time_min=1)

                # Update technician real-time coordinates
                tech.current_latitude = curr_lat
                tech.current_longitude = curr_lng
                req.distance_km = round(rem_dist, 2)
                req.estimated_eta_minutes = rem_eta

                # Log location
                log = LocationLog(
                    technician_id=tech.id,
                    request_id=req.id,
                    latitude=curr_lat,
                    longitude=curr_lng,
                    speed_kmh=32.0,
                    heading=0.0
                )
                db.session.add(log)
                db.session.commit()

                # Emit Socket.IO event to room
                payload = {
                    "requestId": request_id,
                    "technicianId": tech.id,
                    "latitude": curr_lat,
                    "longitude": curr_lng,
                    "distanceRemainingKm": round(rem_dist, 2),
                    "etaMinutes": rem_eta,
                    "speedKmh": 32.0,
                    "timestamp": datetime.utcnow().isoformat()
                }
                socketio.emit("technician_location_update", payload, room=request_id)
                socketio.emit("eta_update", {
                    "requestId": request_id,
                    "etaMinutes": rem_eta,
                    "distanceRemainingKm": round(rem_dist, 2)
                }, room=request_id)

                # Check if arrived (last point or within 100 meters)
                if idx == total_points - 1 or rem_dist < 0.1:
                    req.status = "ARRIVED"
                    db.session.commit()
                    socketio.emit("status_changed", {
                        "requestId": request_id,
                        "status": "ARRIVED",
                        "message": f"{tech.user.full_name} has arrived at your location!"
                    }, room=request_id)
                    break

                # Sleep interval for realistic simulation
                time.sleep(2.5)

        except Exception as e:
            pass
        finally:
            with _SIMULATION_LOCK:
                if request_id in _ACTIVE_SIMULATIONS:
                    del _ACTIVE_SIMULATIONS[request_id]

