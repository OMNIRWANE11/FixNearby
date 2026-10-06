import requests
from typing import Dict, Any, List, Optional
from flask import current_app
from app.services.geo_service import haversine_distance_km, estimate_eta_minutes

class OSRMClient:
    @staticmethod
    def get_route(
        origin_lat: float,
        origin_lng: float,
        dest_lat: float,
        dest_lng: float,
        timeout_seconds: float = 4.0
    ) -> Dict[str, Any]:
        """
        Fetch realistic driving route and polyline geometry from public OSRM.
        Falls back to Haversine straight-line coordinates and formula if OSRM is unreachable.
        """
        base_url = "https://router.project-osrm.org/route/v1/driving"
        if current_app and current_app.config.get("OSRM_BASE_URL"):
            base_url = current_app.config["OSRM_BASE_URL"]

        # OSRM coordinate order is {longitude},{latitude}
        coords_str = f"{origin_lng},{origin_lat};{dest_lng},{dest_lat}"
        url = f"{base_url}/{coords_str}?overview=full&geometries=geojson&steps=false"

        try:
            resp = requests.get(url, timeout=timeout_seconds, headers={"User-Agent": "FixNearby-Emergency-App/1.0"})
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok" and data.get("routes"):
                    primary_route = data["routes"][0]
                    distance_km = primary_route.get("distance", 0) / 1000.0
                    duration_minutes = max(2, int(round(primary_route.get("duration", 0) / 60.0)))
                    geometry = primary_route.get("geometry", {})
                    # geometry['coordinates'] is a list of [lng, lat]
                    # We convert to [[lat, lng], ...] for standard Leaflet usage
                    coordinates = [
                        [pt[1], pt[0]] for pt in geometry.get("coordinates", [])
                    ]

                    return {
                        "success": True,
                        "isOsrm": True,
                        "distanceKm": round(distance_km, 2),
                        "durationMinutes": duration_minutes,
                        "coordinates": coordinates,
                        "fallbackNotice": None
                    }
        except Exception as e:
            # Silently fallback to Haversine
            pass

        # Haversine straight-line fallback
        straight_distance = haversine_distance_km(origin_lat, origin_lng, dest_lat, dest_lng)
        # Add road curvature multiplier (1.25x for urban street layout)
        estimated_road_dist = straight_distance * 1.25
        eta = estimate_eta_minutes(estimated_road_dist)

        # Generate a simple 5-step interpolated line between origin and dest
        steps = 10
        interp_coords = []
        for i in range(steps + 1):
            ratio = i / float(steps)
            lat = origin_lat + (dest_lat - origin_lat) * ratio
            lng = origin_lng + (dest_lng - origin_lng) * ratio
            interp_coords.append([round(lat, 6), round(lng, 6)])

        return {
            "success": True,
            "isOsrm": False,
            "distanceKm": round(estimated_road_dist, 2),
            "durationMinutes": eta,
            "coordinates": interp_coords,
            "fallbackNotice": "Live route unavailable — ETA estimated from distance."
        }

