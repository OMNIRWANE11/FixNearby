from marshmallow import Schema, fields, validate

class EmergencyRequestCreateSchema(Schema):
    categoryId = fields.Integer(required=True)
    problemTypeId = fields.Integer(load_default=None)
    problemCustomDesc = fields.String(load_default=None)
    severity = fields.String(load_default="HIGH", validate=validate.OneOf(["CRITICAL", "HIGH", "NORMAL"]))
    customerName = fields.String(required=True, validate=validate.Length(min=2, max=150))
    customerPhone = fields.String(required=True, validate=validate.Length(min=7, max=25))
    customerAddress = fields.String(load_default="Emergency coordinates")
    customerLatitude = fields.Float(required=True, validate=lambda x: -90.0 <= x <= 90.0)
    customerLongitude = fields.Float(required=True, validate=lambda x: -180.0 <= x <= 180.0)

class RequestAssignSchema(Schema):
    technicianId = fields.String(required=True)

class RequestStatusUpdateSchema(Schema):
    status = fields.String(required=True, validate=validate.OneOf([
        "PENDING", "ASSIGNED", "ON_THE_WAY", "ARRIVED", "COMPLETED", "CANCELLED"
    ]))
    cancellationReason = fields.String(load_default=None)

