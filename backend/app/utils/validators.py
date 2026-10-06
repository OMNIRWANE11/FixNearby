import re

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
PHONE_REGEX = r"^\+?[1-9]\d{6,14}$" # E.164 compatible

def is_valid_email(email: str) -> bool:
    if not email or not isinstance(email, str):
        return False
    return bool(re.match(EMAIL_REGEX, email.strip()))

def is_valid_phone(phone: str) -> bool:
    if not phone or not isinstance(phone, str):
        return False
    cleaned = re.sub(r"[\s\-\(\)]", "", phone)
    return bool(re.match(PHONE_REGEX, cleaned))

def is_valid_coordinates(lat, lng) -> bool:
    try:
        f_lat = float(lat)
        f_lng = float(lng)
        return -90.0 <= f_lat <= 90.0 and -180.0 <= f_lng <= 180.0
    except (ValueError, TypeError):
        return False

