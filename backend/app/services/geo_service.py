import math
from typing import List, Tuple, Dict, Any, Optional
from sqlalchemy import text
from app.extensions import db
from app.models.technician import Technician

EARTH_RADIUS_KM = 6371.0

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees) using Haversine formula.
    """
    try:
        lat1_rad = math.radians(float(lat1))
        lon1_rad = math.radians(float(lon1))
        lat2_rad = math.radians(float(lat2))
        lon2_rad = math.radians(float(lon2))

        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad

        a = math.sin(dlat / 2.0) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2.0) ** 2
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return EARTH_RADIUS_KM * c
    except (ValueError, TypeError, ZeroDivisionError):
        return 0.0

def estimate_eta_minutes(distance_km: float, avg_speed_kmh: float = 30.0, prep_time_min: int = 3) -> int:
    """
    Estimate ETA in minutes based on distance and average urban vehicle speed (30 km/h default).
    """
    if distance_km <= 0:
        return prep_time_min
    travel_time_hours = distance_km / avg_speed_kmh
    travel_time_minutes = travel_time_hours * 60.0
    return max(prep_time_min, int(round(travel_time_minutes + prep_time_min)))

class GeoService:
    @staticmethod
    def find_nearby_technicians(
        lat: float,
        lng: float,
        category_id: Optional[int] = None,
        radius_km: float = 25.0,
        limit: int = 10,
        verified_only: bool = True,
        on_duty_only: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Query nearby technicians using PostGIS ST_DWithin and ST_Distance where available,
        with seamless Haversine fallback if running in non-PostGIS or SQLite test modes.
        """
        radius_meters = radius_km * 1000.0
        results = []

        # Check if database is PostgreSQL with PostGIS
        bind = db.session.get_bind()
        is_postgres = bind.dialect.name == "postgresql"

        if is_postgres:
            try:
                # Optimized PostGIS query
                category_clause = "AND category_id = :category_id" if category_id else ""
                verified_clause = "AND is_verified = TRUE" if verified_only else ""
                duty_clause = "AND is_on_duty = TRUE" if on_duty_only else ""

                sql = f"""
                    SELECT 
                        id,
                        ST_Distance(
                            current_location,
                            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
                        ) / 1000.0 AS distance_km
                    FROM technicians
                    WHERE current_location IS NOT NULL
                      {duty_clause}
                      {verified_clause}
                      {category_clause}
                      AND ST_DWithin(
                          current_location,
                          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                          :radius_meters
                      )
                    ORDER BY ST_Distance(
                        current_location,
                        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
                    ) ASC
                    LIMIT :limit;
                """
                params = {
                    "lat": float(lat),
                    "lng": float(lng),
                    "radius_meters": float(radius_meters),
                    "limit": limit
                }
                if category_id:
                    params["category_id"] = int(category_id)

                rows = db.session.execute(text(sql), params).fetchall()
                tech_ids = [str(r[0]) for r in rows]
                dist_map = {str(r[0]): float(r[1]) for r in rows}

                if tech_ids:
                    techs = Technician.query.filter(Technician.id.in_(tech_ids)).all()
                    tech_lookup = {t.id: t for t in techs}
                    for tid in tech_ids:
                        if tid in tech_lookup:
                            tech = tech_lookup[tid]
                            dist = dist_map[tid]
                            eta = estimate_eta_minutes(dist)
                            results.append({
                                "technician": tech,
                                "distanceKm": round(dist, 2),
                                "etaMinutes": eta
                            })
                    return results
            except Exception as e:
                # Log and fallback to Haversine
                db.session.rollback()

        # Resilient Haversine fallback
        query = Technician.query
        if on_duty_only:
            query = query.filter_by(is_on_duty=True)
        if verified_only:
            query = query.filter_by(is_verified=True)
        if category_id:
            query = query.filter_by(category_id=category_id)

        all_candidates = query.all()
        candidates_with_dist = []

        for tech in all_candidates:
            dist = haversine_distance_km(lat, lng, tech.current_latitude, tech.current_longitude)
            # Check operating radius and requested radius
            max_allowed_radius = min(radius_km, float(tech.operating_radius_km))
            if dist <= max_allowed_radius:
                candidates_with_dist.append((tech, dist))

        # Sort by distance
        candidates_with_dist.sort(key=lambda item: item[1])

        for tech, dist in candidates_with_dist[:limit]:
            results.append({
                "technician": tech,
                "distanceKm": round(dist, 2),
                "etaMinutes": estimate_eta_minutes(dist)
            })

        return results

