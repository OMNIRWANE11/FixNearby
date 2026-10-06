from flask import jsonify

def api_response(data=None, message=None, status_code=200):
    response = {
        "success": True,
        "data": data if data is not None else {},
        "error": None
    }
    if message:
        if isinstance(response["data"], dict):
            response["data"]["_message"] = message
    return jsonify(response), status_code

def api_error(code="ERROR", message="An unexpected error occurred.", status_code=400, details=None):
    err_obj = {
        "code": code,
        "message": message
    }
    if details:
        err_obj["details"] = details
    return jsonify({
        "success": False,
        "data": None,
        "error": err_obj
    }), status_code

class ApiException(Exception):
    def __init__(self, message, code="API_ERROR", status_code=400, details=None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details

