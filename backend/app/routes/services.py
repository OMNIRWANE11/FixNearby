from flask import Blueprint, jsonify
from app.models.service_category import ServiceCategory, ProblemType
from app.utils.errors import api_response, api_error

services_bp = Blueprint("services", __name__)

@services_bp.route("/categories", methods=["GET"])
def get_categories():
    categories = ServiceCategory.query.filter_by(is_active=True).all()
    data = [cat.to_dict(include_problems=True) for cat in categories]
    return api_response(data)

@services_bp.route("/categories/<int:category_id>/problems", methods=["GET"])
def get_category_problems(category_id):
    category = ServiceCategory.query.get(category_id)
    if not category:
        return api_error("NOT_FOUND", f"Service category #{category_id} not found.", 404)

    problems = ProblemType.query.filter_by(category_id=category_id).all()
    return api_response([p.to_dict() for p in problems])

