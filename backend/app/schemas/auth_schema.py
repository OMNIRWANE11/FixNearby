from marshmallow import Schema, fields, validate

class RegisterSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6, max=100))
    fullName = fields.String(required=True, validate=validate.Length(min=2, max=150))
    phone = fields.String(required=True, validate=validate.Length(min=7, max=25))
    role = fields.String(load_default="customer", validate=validate.OneOf(["customer", "technician"]))
    savedAddress = fields.String(load_default=None)
    savedLatitude = fields.Float(load_default=None)
    savedLongitude = fields.Float(load_default=None)
    
    # Optional technician fields if registering directly as technician
    categoryId = fields.Integer(load_default=None)
    trade = fields.String(load_default=None)
    experienceYears = fields.Integer(load_default=1)
    operatingRadiusKm = fields.Float(load_default=15.0)

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True)

class ProfileUpdateSchema(Schema):
    fullName = fields.String(validate=validate.Length(min=2, max=150))
    phone = fields.String(validate=validate.Length(min=7, max=25))
    savedAddress = fields.String()
    savedLatitude = fields.Float()
    savedLongitude = fields.Float()

