import os
from flask import Flask, jsonify
from app.config import config_by_name
from app.extensions import db, migrate, jwt, cors, socketio, limiter
from app.routes import register_routes
from app.sockets.tracking_events import register_socket_events
from app.utils.errors import api_error

def create_app(config_name=None):
    if not config_name:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name["default"]))

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": "*"}})
    socketio.init_app(app, cors_allowed_origins="*")
    limiter.init_app(app)

    # Register API blueprints
    register_routes(app)

    # Register Socket.IO event listeners
    register_socket_events(socketio)

    # Global Error Handlers
    @app.errorhandler(404)
    def handle_not_found(e):
        return api_error("NOT_FOUND", "The requested resource could not be found.", 404)

    @app.errorhandler(405)
    def handle_method_not_allowed(e):
        return api_error("METHOD_NOT_ALLOWED", "HTTP method not allowed on this endpoint.", 405)

    @app.errorhandler(429)
    def handle_rate_limit(e):
        return api_error("RATE_LIMIT_EXCEEDED", "Rate limit exceeded. Please try again shortly.", 429)

    @app.errorhandler(500)
    def handle_internal_server_error(e):
        return api_error("INTERNAL_SERVER_ERROR", "An unexpected server error occurred.", 500)

    @app.route("/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "FixNearby Backend API",
            "version": "1.0.0"
        }), 200

    return app

