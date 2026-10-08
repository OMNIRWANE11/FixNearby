import uuid
from datetime import datetime
from app.extensions import db

try:
    from geoalchemy2 import Geography
except ImportError:
    Geography = None

class EmergencyRequest(db.Model):
    __tablename__ = "emergency_requests"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey("service_categories.id"), nullable=False, index=True)
    problem_type_id = db.Column(db.Integer, db.ForeignKey("problem_types.id"), nullable=True)
    problem_custom_desc = db.Column(db.Text, nullable=True)
    severity = db.Column(db.String(20), default="HIGH", nullable=False) # CRITICAL, HIGH, NORMAL
    
    customer_name = db.Column(db.String(150), nullable=False)
    customer_phone = db.Column(db.String(25), nullable=False)
    customer_address = db.Column(db.Text, nullable=True)
    customer_latitude = db.Column(db.Float, nullable=False)
    customer_longitude = db.Column(db.Float, nullable=False)

    if Geography is not None:
        try:
            from app.config import get_database_uri
            if "sqlite" in get_database_uri():
                customer_location = None
            else:
                customer_location = db.Column(Geography(geometry_type='POINT', srid=4326), nullable=True)
        except Exception:
            customer_location = None
    else:
        customer_location = None

    status = db.Column(db.String(30), default="PENDING", nullable=False, index=True)
    # Statuses: PENDING, ASSIGNED, ON_THE_WAY, ARRIVED, COMPLETED, CANCELLED
    assigned_technician_id = db.Column(db.String(36), db.ForeignKey("technicians.id", ondelete="SET NULL"), nullable=True, index=True)
    distance_km = db.Column(db.Float, nullable=True)
    estimated_eta_minutes = db.Column(db.Integer, nullable=True)
    route_polyline = db.Column(db.Text, nullable=True) # Encoded polyline or coordinate json
    cancellation_reason = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    problem_type = db.relationship("ProblemType", foreign_keys=[problem_type_id])
    review = db.relationship("Review", backref="request", uselist=False, cascade="all, delete-orphan")
    location_logs = db.relationship("LocationLog", backref="request", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "categoryId": self.category_id,
            "categoryName": self.category.name if self.category else None,
            "problemTypeId": self.problem_type_id,
            "problemName": self.problem_type.name if self.problem_type else self.problem_custom_desc,
            "problemDescription": self.problem_custom_desc,
            "severity": self.severity,
            "customerName": self.customer_name,
            "customerPhone": self.customer_phone,
            "customerAddress": self.customer_address,
            "customerLatitude": self.customer_latitude,
            "customerLongitude": self.customer_longitude,
            "status": self.status,
            "assignedTechnicianId": self.assigned_technician_id,
            "technician": self.assigned_technician.to_dict() if self.assigned_technician else None,
            "distanceKm": round(float(self.distance_km), 2) if self.distance_km else None,
            "estimatedEtaMinutes": self.estimated_eta_minutes,
            "routePolyline": self.route_polyline,
            "cancellationReason": self.cancellation_reason,
            "hasReview": bool(self.review),
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None
        }

