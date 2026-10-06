import uuid
from datetime import datetime
import bcrypt
from app.extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(25), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="customer")  # customer, technician, admin
    saved_address = db.Column(db.Text, nullable=True)
    saved_latitude = db.Column(db.Float, nullable=True)
    saved_longitude = db.Column(db.Float, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    technician_profile = db.relationship("Technician", backref="user", uselist=False, cascade="all, delete-orphan")
    requests = db.relationship("EmergencyRequest", backref="user", lazy="dynamic", foreign_keys="EmergencyRequest.user_id")
    reviews = db.relationship("Review", backref="user", lazy="dynamic")

    def set_password(self, password: str):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    def check_password(self, password: str) -> bool:
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode("utf-8"), self.password_hash.encode("utf-8"))

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "fullName": self.full_name,
            "phone": self.phone,
            "role": self.role,
            "savedAddress": self.saved_address,
            "savedLatitude": self.saved_latitude,
            "savedLongitude": self.saved_longitude,
            "isActive": self.is_active,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }

