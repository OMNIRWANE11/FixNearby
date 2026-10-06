from functools import wraps
from flask import request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.user import User
from app.utils.errors import api_error

def role_required(*allowed_roles):
    """Decorator to enforce role-based access control"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except Exception as e:
                return api_error("UNAUTHORIZED", f"Authentication token required or invalid: {str(e)}", 401)
            
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or not user.is_active:
                return api_error("UNAUTHORIZED", "User account not found or inactive.", 401)
            
            if user.role not in allowed_roles:
                return api_error("FORBIDDEN", f"Access forbidden for role '{user.role}'. Required: {list(allowed_roles)}", 403)
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def get_current_user():
    """Retrieve current authenticated user object or None"""
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            return User.query.get(user_id)
    except Exception:
        pass
    return None

