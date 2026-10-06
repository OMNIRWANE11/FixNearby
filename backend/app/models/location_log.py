from datetime import datetime
from app.extensions import db

class LocationLog(db.Model):
    __tablename__ = "location_logs"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    technician_id = db.Column(db.String(36), db.ForeignKey("technicians.id", ondelete="CASCADE"), nullable=False, index=True)
    request_id = db.Column(db.String(36), db.ForeignKey("emergency_requests.id", ondelete="CASCADE"), nullable=True, index=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    speed_kmh = db.Column(db.Float, nullable=True)
    heading = db.Column(db.Float, nullable=True)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "technicianId": self.technician_id,
            "requestId": self.request_id,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "speedKmh": self.speed_kmh,
            "heading": self.heading,
            "recordedAt": self.recorded_at.isoformat() if self.recorded_at else None
        }

