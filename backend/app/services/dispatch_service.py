import json
from typing import Dict, Any, List, Optional
from app.extensions import db
from app.models.emergency_request import EmergencyRequest
from app.models.technician import Technician
from app.services.geo_service import GeoService
from app.services.osrm_client import OSRMClient

class DispatchService:
    @staticmethod
    def create_and_dispatch_emergency(data: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Processes new emergency request, saves record, queries nearby verified on-duty technicians,
        and computes ETA / routing.
        """
        lat = float(data["customerLatitude"])
        lng = float(data["customerLongitude"])
        category_id = int(data["categoryId"])

        # Create emergency request record in DB
        request_record = EmergencyRequest(
            user_id=user_id,
            category_id=category_id,
            problem_type_id=data.get("problemTypeId"),
            problem_custom_desc=data.get("problemCustomDesc"),
            severity=data.get("severity", "HIGH"),
            customer_name=data["customerName"],
            customer_phone=data["customerPhone"],
            customer_address=data.get("customerAddress", "Current GPS location"),
            customer_latitude=lat,
            customer_longitude=lng,
            status="PENDING"
        )
        db.session.add(request_record)
        db.session.commit()

        # Find nearby candidate technicians
        nearby_candidates = GeoService.find_nearby_technicians(
            lat=lat,
            lng=lng,
            category_id=category_id,
            radius_km=25.0,
            limit=6,
            verified_only=True,
            on_duty_only=True
        )

        candidates_list = []
        best_route = None

        for idx, item in enumerate(nearby_candidates):
            tech = item["technician"]
            dist_km = item["distanceKm"]
            eta_min = item["etaMinutes"]

            # Compute actual street route for the closest technician
            route_info = None
            if idx == 0:
                route_info = OSRMClient.get_route(
                    origin_lat=tech.current_latitude,
                    origin_lng=tech.current_longitude,
                    dest_lat=lat,
                    dest_lng=lng
                )
                if route_info.get("success"):
                    dist_km = route_info.get("distanceKm", dist_km)
                    eta_min = route_info.get("durationMinutes", eta_min)
                    best_route = route_info

            candidates_list.append({
                "id": tech.id,
                "badgeCode": tech.badge_code,
                "name": tech.user.full_name if tech.user else "Technician",
                "trade": tech.trade,
                "phone": tech.phone,
                "whatsappNumber": tech.whatsapp_number,
                "rating": round(float(tech.rating), 1),
                "jobsCompleted": tech.jobs_completed,
                "profileImageUrl": tech.profile_image_url or "/images/technicians/tech-default.svg",
                "isVerified": tech.is_verified,
                "distanceKm": dist_km,
                "etaMinutes": eta_min,
                "currentLatitude": tech.current_latitude,
                "currentLongitude": tech.current_longitude
            })

        # Pre-assign first closest technician if available
        if candidates_list:
            top_tech = candidates_list[0]
            request_record.distance_km = top_tech["distanceKm"]
            request_record.estimated_eta_minutes = top_tech["etaMinutes"]
            if best_route and best_route.get("coordinates"):
                request_record.route_polyline = json.dumps(best_route["coordinates"])
            db.session.commit()

        return {
            "request": request_record.to_dict(),
            "candidatesFound": len(candidates_list),
            "candidates": candidates_list,
            "primaryRoute": best_route
        }

    @staticmethod
    def assign_technician(request_id: str, technician_id: str) -> Dict[str, Any]:
        """
        Assigns selected technician to emergency request and calculates route.
        """
        req = EmergencyRequest.query.get(request_id)
        if not req:
            raise ValueError("Emergency request not found.")
        
        tech = Technician.query.get(technician_id)
        if not tech:
            raise ValueError("Technician not found.")

        # Compute route between technician and customer
        route_info = OSRMClient.get_route(
            origin_lat=tech.current_latitude,
            origin_lng=tech.current_longitude,
            dest_lat=req.customer_latitude,
            dest_lng=req.customer_longitude
        )

        req.assigned_technician_id = tech.id
        req.status = "ASSIGNED"
        req.distance_km = route_info.get("distanceKm", 0.0)
        req.estimated_eta_minutes = route_info.get("durationMinutes", 10)
        req.route_polyline = json.dumps(route_info.get("coordinates", []))

        db.session.commit()

        return {
            "request": req.to_dict(),
            "route": route_info
        }

