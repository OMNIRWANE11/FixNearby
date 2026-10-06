from flask import Blueprint
from app.routes.auth import auth_bp
from app.routes.services import services_bp
from app.routes.technicians import technicians_bp
from app.routes.verification import verification_bp
from app.routes.requests import requests_bp
from app.routes.tracking import tracking_bp
from app.routes.provider import provider_bp
from app.routes.admin import admin_bp

def register_routes(app):
    api_bp = Blueprint("api_v1", __name__, url_prefix="/api/v1")

    api_bp.register_blueprint(auth_bp, url_prefix="/auth")
    api_bp.register_blueprint(services_bp, url_prefix="")
    api_bp.register_blueprint(technicians_bp, url_prefix="/technicians")
    api_bp.register_blueprint(verification_bp, url_prefix="/verify")
    api_bp.register_blueprint(requests_bp, url_prefix="/requests")
    api_bp.register_blueprint(tracking_bp, url_prefix="/tracking")
    api_bp.register_blueprint(provider_bp, url_prefix="/provider")
    api_bp.register_blueprint(admin_bp, url_prefix="/admin")

    app.register_blueprint(api_bp)

