from datetime import datetime
from app.extensions import db

class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    request_id = db.Column(db.String(36), db.ForeignKey("emergency_requests.id", ondelete="CASCADE"), unique=True, nullable=False)
    technician_id = db.Column(db.String(36), db.ForeignKey("technicians.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    customer_name = db.Column(db.String(150), nullable=False)
    rating = db.Column(db.Integer, nullable=False) # 1 to 5
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "requestId": self.request_id,
            "technicianId": self.technician_id,
            "userId": self.user_id,
            "customerName": self.customer_name,
            "rating": self.rating,
            "comment": self.comment,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }

