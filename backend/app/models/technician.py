import uuid
from datetime import datetime
from app.extensions import db

try:
    # from geoalchemy2 import Geography
    Geography = None
except ImportError:
    Geography = None

class Technician(db.Model):
    __tablename__ = "technicians"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("service_categories.id"), nullable=False, index=True)
    badge_code = db.Column(db.String(10), unique=True, nullable=False, index=True)
    trade = db.Column(db.String(100), nullable=False)
    experience_years = db.Column(db.Integer, default=1, nullable=False)
    phone = db.Column(db.String(25), nullable=False)
    whatsapp_number = db.Column(db.String(25), nullable=False)
    rating = db.Column(db.Float, default=5.0, nullable=False)
    jobs_completed = db.Column(db.Integer, default=0, nullable=False)
    operating_radius_km = db.Column(db.Float, default=15.0, nullable=False)
    is_on_duty = db.Column(db.Boolean, default=False, nullable=False, index=True)
    is_verified = db.Column(db.Boolean, default=False, nullable=False, index=True)
    profile_image_url = db.Column(db.String(255), nullable=True)
    specialties = db.Column(db.Text, nullable=True) # comma-separated
    current_latitude = db.Column(db.Float, nullable=False)
    current_longitude = db.Column(db.Float, nullable=False)

    shop_name = db.Column(db.String(150), nullable=True)
    shop_address = db.Column(db.String(255), nullable=True)
    shop_contact = db.Column(db.String(50), nullable=True)
    education_degree = db.Column(db.String(150), nullable=True)
    certifications = db.Column(db.String(255), nullable=True)
    license_number = db.Column(db.String(100), nullable=True)

    # PostGIS Geography Column (if available in PostgreSQL environment)
    if Geography is not None:
        current_location = db.Column(Geography(geometry_type='POINT', srid=4326, spatial_index=True), nullable=True)
    else:
        current_location = None

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    credential = db.relationship("Credential", backref="technician", uselist=False, cascade="all, delete-orphan")
    assigned_requests = db.relationship("EmergencyRequest", backref="assigned_technician", lazy="dynamic", foreign_keys="EmergencyRequest.assigned_technician_id")
    reviews = db.relationship("Review", backref="technician", lazy="dynamic", cascade="all, delete-orphan")
    location_logs = db.relationship("LocationLog", backref="technician", lazy="dynamic", cascade="all, delete-orphan")

    @property
    def is_busy(self):
        # A technician is busy if they have any request that is currently active
        from app.models.emergency_request import EmergencyRequest
        active_statuses = ["ASSIGNED", "ON_THE_WAY", "ARRIVED"]
        active_count = self.assigned_requests.filter(EmergencyRequest.status.in_(active_statuses)).count()
        return active_count > 0

    def to_dict(self, include_credentials=False, distance_km=None, eta_minutes=None):
        data = {
            "id": self.id,
            "userId": self.user_id,
            "categoryId": self.category_id,
            "categoryName": self.category.name if self.category else None,
            "badgeCode": self.badge_code,
            "name": self.user.full_name if self.user else "Technician",
            "trade": self.trade,
            "experienceYears": self.experience_years,
            "phone": self.phone,
            "whatsappNumber": self.whatsapp_number,
            "rating": round(float(self.rating), 1),
            "jobsCompleted": self.jobs_completed,
            "operatingRadiusKm": float(self.operating_radius_km),
            "isOnDuty": self.is_on_duty,
            "isBusy": self.is_busy,
            "isVerified": self.is_verified,
            "profileImageUrl": self.profile_image_url or "/images/technicians/tech-default.svg",
            "specialties": [s.strip() for s in self.specialties.split(",")] if self.specialties else [],
            "currentLatitude": self.current_latitude,
            "currentLongitude": self.current_longitude,
            "shopName": self.shop_name,
            "shopAddress": self.shop_address,
            "shopContact": self.shop_contact,
            "educationDegree": self.education_degree,
            "certifications": self.certifications,
            "licenseNumber": self.license_number,
            "distanceKm": round(distance_km, 1) if distance_km is not None else None,
            "etaMinutes": eta_minutes,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }

        if include_credentials and self.credential:
            data["verificationAudit"] = self.credential.to_audit_dict(rating=self.rating, jobs_completed=self.jobs_completed)

        return data

