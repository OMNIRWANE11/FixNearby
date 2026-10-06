from datetime import datetime
from app.extensions import db

class ServiceCategory(db.Model):
    __tablename__ = "service_categories"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(20), nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    problem_types = db.relationship("ProblemType", backref="category", lazy="dynamic", cascade="all, delete-orphan")
    technicians = db.relationship("Technician", backref="category", lazy="dynamic")
    requests = db.relationship("EmergencyRequest", backref="category", lazy="dynamic")

    def to_dict(self, include_problems=False):
        data = {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "icon": self.icon,
            "imageUrl": self.image_url,
            "description": self.description,
            "isActive": self.is_active,
            "technicianCount": self.technicians.filter_by(is_on_duty=True).count()
        }
        if include_problems:
            data["problemTypes"] = [p.to_dict() for p in self.problem_types.all()]
        return data


class ProblemType(db.Model):
    __tablename__ = "problem_types"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category_id = db.Column(db.Integer, db.ForeignKey("service_categories.id", ondelete="CASCADE"), nullable=False, index=True)
    code = db.Column(db.String(80), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    urgency_default = db.Column(db.String(20), default="HIGH", nullable=False)  # CRITICAL, HIGH, NORMAL
    safety_instructions = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("category_id", "code", name="uq_category_problem"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "categoryId": self.category_id,
            "code": self.code,
            "name": self.name,
            "description": self.description,
            "urgencyDefault": self.urgency_default,
            "safetyInstructions": self.safety_instructions
        }

