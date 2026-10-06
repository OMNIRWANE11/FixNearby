from marshmallow import Schema, fields, validate

class VerificationQuerySchema(Schema):
    badgeCode = fields.String(required=True, validate=validate.Regexp(r"^FN-[A-Z0-9]{5}$", error="Invalid badge code format. Expected format: FN-XXXXX"))

class CredentialUpdateSchema(Schema):
    identityVerified = fields.Boolean()
    licenseVerified = fields.Boolean()
    licenseNumber = fields.String()
    tradeLicenseName = fields.String()
    licenseValidUntil = fields.Date()
    addressVerified = fields.Boolean()
    residentialAddress = fields.String()
    policeVerified = fields.Boolean()
    policeClearanceNumber = fields.String()
    policeCheckDate = fields.Date()
    auditNotes = fields.String()
    failureReasons = fields.String()

