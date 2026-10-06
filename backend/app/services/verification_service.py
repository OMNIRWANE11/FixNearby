from typing import Dict, Any, Optional
from app.extensions import db
from app.models.technician import Technician
from app.models.credential import Credential
from app.utils.badge_generator import validate_badge_format

class VerificationService:
    @staticmethod
    def verify_badge_code(badge_code: str, ip_address: Optional[str] = None) -> Dict[str, Any]:
        """
        Comprehensive 4-Point Badge Verification Audit.
        Validates badge format, technician presence, credential checks, and logs inquiry.
        """
        clean_code = (badge_code or "").strip().upper()

        if not validate_badge_format(clean_code):
            return {
                "badgeCode": clean_code,
                "overallStatus": "INVALID_FORMAT",
                "isVerified": False,
                "errorMessage": f"Badge code '{clean_code}' does not match required format FN-XXXXX.",
                "technician": None,
                "audit": None
            }

        technician = Technician.query.filter_by(badge_code=clean_code).first()

        if not technician:
            return {
                "badgeCode": clean_code,
                "overallStatus": "NOT_FOUND",
                "isVerified": False,
                "errorMessage": f"No registered technician found with badge code '{clean_code}'. Please double check the technician's physical ID.",
                "technician": None,
                "audit": None
            }

        # Check credentials and 4-point audit
        credential = technician.credential
        if not credential:
            # Create a placeholder unverified credential if missing
            credential = Credential(
                technician_id=technician.id,
                legal_name=technician.user.full_name if technician.user else "Unknown",
                identity_verified=False,
                license_verified=False,
                address_verified=False,
                police_verified=False,
                failure_reasons="Credentials not submitted or under review."
            )
            db.session.add(credential)
            db.session.commit()

        audit = credential.to_audit_dict(rating=technician.rating, jobs_completed=technician.jobs_completed)
        is_fully_verified = audit["allPassed"]

        # Ensure technician.is_verified matches audit state
        if technician.is_verified != is_fully_verified:
            technician.is_verified = is_fully_verified
            db.session.commit()

        # Build clean, safe public technician profile
        tech_summary = {
            "id": technician.id,
            "badgeCode": technician.badge_code,
            "name": technician.user.full_name if technician.user else "Technician",
            "trade": technician.trade,
            "profileImageUrl": technician.profile_image_url or "/images/technicians/tech-default.svg",
            "rating": round(float(technician.rating), 1),
            "jobsCompleted": technician.jobs_completed,
            "experienceYears": technician.experience_years,
            "operatingRadiusKm": float(technician.operating_radius_km),
            "isOnDuty": technician.is_on_duty,
            "phone": technician.phone,
            "whatsappNumber": technician.whatsapp_number,
            "specialties": [s.strip() for s in technician.specialties.split(",")] if technician.specialties else []
        }

        return {
            "badgeCode": clean_code,
            "overallStatus": "VERIFIED" if is_fully_verified else "NOT_VERIFIED",
            "isVerified": is_fully_verified,
            "errorMessage": None if is_fully_verified else "One or more safety verification checks failed or are incomplete.",
            "technician": tech_summary,
            "audit": audit
        }

