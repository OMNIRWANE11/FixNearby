from flask import Blueprint, request
from app.extensions import limiter
from app.services.verification_service import VerificationService
from app.utils.errors import api_response, api_error

verification_bp = Blueprint("verification", __name__)

@verification_bp.route("/<string:badge_code>", methods=["GET"])
@limiter.limit("10 per minute")
def verify_badge(badge_code):
    ip_addr = request.remote_addr
    result = VerificationService.verify_badge_code(badge_code, ip_address=ip_addr)

    if result["overallStatus"] == "INVALID_FORMAT":
        return api_error("INVALID_FORMAT", result["errorMessage"], 400, {
            "expectedFormat": "FN-XXXXX (e.g. FN-88492)",
            "received": badge_code
        })

    if result["overallStatus"] == "NOT_FOUND":
        return api_error("NOT_FOUND", result["errorMessage"], 404, {
            "badgeCode": badge_code,
            "securityWarning": "Unverified or unknown badge code. Do not permit entry."
        })

    return api_response(result)

