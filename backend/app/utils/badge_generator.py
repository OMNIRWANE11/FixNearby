import random
import string
import re

BADGE_REGEX = r"^FN-[A-Z0-9]{5}$"

def validate_badge_format(badge_code: str) -> bool:
    if not badge_code or not isinstance(badge_code, str):
        return False
    return bool(re.match(BADGE_REGEX, badge_code.strip().upper()))

def generate_random_badge_code() -> str:
    # 5 uppercase alphanumeric chars avoiding ambiguous characters (like O, 0, I, 1) where possible
    chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    suffix = "".join(random.choices(chars, k=5))
    return f"FN-{suffix}"

def generate_unique_badge(existing_check_func) -> str:
    max_attempts = 100
    for _ in range(max_attempts):
        code = generate_random_badge_code()
        if not existing_check_func(code):
            return code
    # Fallback to random uppercase alphanumeric
    fallback_chars = string.ascii_uppercase + string.digits
    for _ in range(max_attempts):
        code = "FN-" + "".join(random.choices(fallback_chars, k=5))
        if not existing_check_func(code):
            return code
    raise RuntimeError("Failed to generate a collision-free badge code.")

