from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError
from app.extensions import db
from app.models.user import User
from app.models.technician import Technician
from app.models.credential import Credential
from app.models.emergency_request import EmergencyRequest
from app.schemas.verification_schema import CredentialUpdateSchema
from app.utils.errors import api_response, api_error
from app.utils.security import role_required
from app.utils.badge_generator import generate_unique_badge

admin_bp = Blueprint("admin", __name__)
cred_schema = CredentialUpdateSchema()

@admin_bp.route("/dashboard", methods=["GET"])
@role_required("admin")
def get_dashboard_metrics():
    total_techs = Technician.query.count()
    verified_techs = Technician.query.filter_by(is_verified=True).count()
    pending_techs = total_techs - verified_techs
    on_duty_techs = Technician.query.filter_by(is_on_duty=True).count()
    active_requests = EmergencyRequest.query.filter(
        EmergencyRequest.status.in_(["PENDING", "ASSIGNED", "ON_THE_WAY", "ARRIVED"])
    ).count()
    completed_requests = EmergencyRequest.query.filter_by(status="COMPLETED").count()

    return api_response({
        "metrics": {
            "totalTechnicians": total_techs,
            "verifiedTechnicians": verified_techs,
            "pendingVerification": pending_techs,
            "onDutyTechnicians": on_duty_techs,
            "activeEmergencyRequests": active_requests,
            "completedEmergencyRequests": completed_requests
        }
    })

@admin_bp.route("/technicians", methods=["GET"])
@role_required("admin")
def list_admin_technicians():
    techs = Technician.query.order_by(Technician.created_at.desc()).all()
    return api_response([t.to_dict(include_credentials=True) for t in techs])

@admin_bp.route("/technicians/<string:tech_id>/credentials", methods=["PATCH"])
@role_required("admin")
def update_technician_credentials(tech_id):
    tech = Technician.query.get(tech_id)
    if not tech:
        return api_error("NOT_FOUND", "Technician not found.", 404)

    payload = request.get_json() or {}
    try:
        data = cred_schema.load(payload)
    except ValidationError as err:
        return api_error("VALIDATION_ERROR", "Invalid credential payload", 400, err.messages)

    cred = tech.credential
    if not cred:
        cred = Credential(technician_id=tech.id, legal_name=tech.user.full_name)
        db.session.add(cred)

    if "identityVerified" in data:
        cred.identity_verified = data["identityVerified"]
    if "licenseVerified" in data:
        cred.license_verified = data["licenseVerified"]
    if "licenseNumber" in data:
        cred.license_number = data["licenseNumber"]
    if "tradeLicenseName" in data:
        cred.trade_license_name = data["tradeLicenseName"]
    if "addressVerified" in data:
        cred.address_verified = data["addressVerified"]
    if "residentialAddress" in data:
        cred.residential_address = data["residentialAddress"]
    if "policeVerified" in data:
        cred.police_verified = data["policeVerified"]
    if "policeClearanceNumber" in data:
        cred.police_clearance_number = data["policeClearanceNumber"]
    if "auditNotes" in data:
        cred.audit_notes = data["auditNotes"]
    if "failureReasons" in data:
        cred.failure_reasons = data["failureReasons"]

    # Recompute overall verification state
    is_rating_valid = (tech.rating >= 4.0 and tech.jobs_completed >= 5)
    all_passed = (
        cred.identity_verified and 
        cred.license_verified and 
        cred.address_verified and 
        cred.police_verified and 
        is_rating_valid
    )
    tech.is_verified = all_passed

    db.session.commit()

    return api_response(tech.to_dict(include_credentials=True), "Credentials updated successfully")

@admin_bp.route("/technicians/<string:tech_id>", methods=["DELETE"])
@role_required("admin")
def delete_technician(tech_id):
    tech = Technician.query.get(tech_id)
    if not tech:
        return api_error("NOT_FOUND", "Technician not found.", 404)

    # Deactivate associated user
    if tech.user:
        tech.user.is_active = False
    tech.is_on_duty = False
    db.session.delete(tech)
    db.session.commit()

    return api_response({"deletedId": tech_id}, "Technician removed successfully")

