from marshmallow import Schema, fields, validate

class TechnicianLocationUpdateSchema(Schema):
    latitude = fields.Float(required=True, validate=lambda x: -90.0 <= x <= 90.0)
    longitude = fields.Float(required=True, validate=lambda x: -180.0 <= x <= 180.0)
    speedKmh = fields.Float(load_default=0.0)
    heading = fields.Float(load_default=0.0)
    requestId = fields.String(load_default=None)

class TechnicianDutySchema(Schema):
    isOnDuty = fields.Boolean(required=True)

class TechnicianFilterSchema(Schema):
    category = fields.String(load_default=None)
    categoryId = fields.Integer(load_default=None)
    onDutyOnly = fields.Boolean(load_default=False)
    verifiedOnly = fields.Boolean(load_default=False)
    minRating = fields.Float(load_default=0.0)
    lat = fields.Float(load_default=None)
    lng = fields.Float(load_default=None)
    radiusKm = fields.Float(load_default=25.0)
    sort = fields.String(load_default="nearest", validate=validate.OneOf(["nearest", "rating", "eta", "experience"]))
    search = fields.String(load_default=None)

