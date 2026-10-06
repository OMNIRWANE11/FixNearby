from datetime import datetime
from app.extensions import db

class Credential(db.Model):
    __tablename__ = "credentials"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    technician_id = db.Column(db.String(36), db.ForeignKey("technicians.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    legal_name = db.Column(db.String(150), nullable=False)
    
    # 1. Identity Check
    identity_verified = db.Column(db.Boolean, default=False, nullable=False)
    identity_document_type = db.Column(db.String(50), default="Government National ID")
    
    # 2. Trade License
    license_number = db.Column(db.String(100), nullable=True)
    trade_license_name = db.Column(db.String(150), nullable=True)
    license_verified = db.Column(db.Boolean, default=False, nullable=False)
    license_valid_until = db.Column(db.Date, nullable=True)
    
    # 3. Address & Police Check
    address_verified = db.Column(db.Boolean, default=False, nullable=False)
    residential_address = db.Column(db.Text, nullable=True) # Stored securely, never publicly revealed
    police_verified = db.Column(db.Boolean, default=False, nullable=False)
    police_clearance_number = db.Column(db.String(100), nullable=True)
    police_check_date = db.Column(db.Date, nullable=True)

    audit_notes = db.Column(db.Text, nullable=True)
    failure_reasons = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_audit_dict(self, rating=5.0, jobs_completed=0):
        """
        Returns safe, 4-point public audit verification details.
        Never exposes sensitive identity documents or private addresses.
        """
        is_rating_valid = rating >= 4.0 and jobs_completed >= 5
        rating_fail_reason = None
        if not is_rating_valid:
            if rating < 4.0:
                rating_fail_reason = f"Average customer rating ({rating:.1f}/5.0) is below safety standard threshold (4.0/5.0)."
            elif jobs_completed < 5:
                rating_fail_reason = f"Completed jobs ({jobs_completed}) is below minimum verification threshold (5 completed jobs)."

        checks = {
            "identityCheck": {
                "title": "Identity Verification",
                "status": "PASS" if self.identity_verified else "FAIL",
                "passed": self.identity_verified,
                "legalName": self.legal_name,
                "details": "Government photo identity verified with facial matching" if self.identity_verified else "Identity document pending or verification failed",
                "reason": None if self.identity_verified else "Government identity check not passed or unverified."
            },
            "licenseCheck": {
                "title": "Trade License & Skills",
                "status": "PASS" if self.license_verified else "FAIL",
                "passed": self.license_verified,
                "licenseNumberMasked": f"LIC-****{self.license_number[-4:]}" if (self.license_number and len(self.license_number) >= 4) else (self.license_number or "NOT PROVIDED"),
                "tradeName": self.trade_license_name or "Trade Certification",
                "validUntil": self.license_valid_until.isoformat() if self.license_valid_until else None,
                "details": "Valid technical skills license verified" if self.license_verified else "No valid certified trade license on record",
                "reason": None if self.license_verified else "Trade license is expired or has not been certified."
            },
            "policeCheck": {
                "title": "Address & Police Background",
                "status": "PASS" if (self.address_verified and self.police_verified) else "FAIL",
                "passed": (self.address_verified and self.police_verified),
                "addressStatus": "Verified Physical Address" if self.address_verified else "Unverified Address",
                "policeStatus": "Police Clearance Certificate Verified" if self.police_verified else "Pending Police Clearance",
                "verifiedDate": self.police_check_date.isoformat() if self.police_check_date else None,
                "details": "Residential physical address and criminal record clearance passed" if (self.address_verified and self.police_verified) else "Background verification checks incomplete",
                "reason": None if (self.address_verified and self.police_verified) else "Pending criminal record verification or physical address verification."
            },
            "ratingCheck": {
                "title": "Customer Trust Rating",
                "status": "PASS" if is_rating_valid else "FAIL",
                "passed": is_rating_valid,
                "currentRating": round(float(rating), 1),
                "minimumRequired": 4.0,
                "jobsCompleted": jobs_completed,
                "minimumJobs": 5,
                "details": f"{rating:.1f}/5.0 star safety rating across {jobs_completed} jobs" if is_rating_valid else "Below minimum trust threshold",
                "reason": rating_fail_reason
            }
        }

        all_passed = (
            self.identity_verified and 
            self.license_verified and 
            self.address_verified and 
            self.police_verified and 
            is_rating_valid
        )

        return {
            "allPassed": all_passed,
            "overallStatus": "VERIFIED" if all_passed else "NOT_VERIFIED",
            "checks": checks,
            "notes": self.audit_notes,
            "declaredFailureReasons": self.failure_reasons
        }

