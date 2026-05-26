from __future__ import annotations

import logging
from pathlib import Path

import os

from flask import Flask, jsonify, request, send_from_directory

from backend.config import Config, DevelopmentConfig, ProductionConfig
from backend.extensions import cors, csrf, db, jwt, limiter
from backend.models import TokenBlocklist, User
from backend.routes.admin import admin_bp
from backend.routes.auth import auth_bp
from backend.routes.medicines import medicines_bp
from backend.routes.requests import requests_bp
from backend.routes.user import user_bp


logger = logging.getLogger(__name__)


CONFIG_MAP = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}


def _select_config():
    env_name = os.getenv("FLASK_ENV", os.getenv("APP_ENV", "development")).lower()
    return CONFIG_MAP.get(env_name, Config)


def create_app(config_object: type[Config] | None = None) -> Flask:
    app = Flask(__name__, static_folder=None)
    app.config.from_object(config_object or _select_config())

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

    db.init_app(app)
    jwt.init_app(app)
    app.config.setdefault("RATELIMIT_STORAGE_URI", app.config["LIMITER_STORAGE_URI"])
    limiter.init_app(app)
    csrf.init_app(app)
    cors.init_app(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)

    app.register_blueprint(auth_bp)
    app.register_blueprint(medicines_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(requests_bp)
    app.register_blueprint(admin_bp)

    @jwt.token_in_blocklist_loader
    def token_in_blocklist(_, jwt_payload):
        jti = jwt_payload["jti"]
        return TokenBlocklist.query.filter_by(jti=jti).first() is not None

    @jwt.revoked_token_loader
    def revoked_token_callback(_jwt_header, _jwt_payload):
        return jsonify({"success": False, "data": None, "message": "Token has been revoked."}), 401

    @jwt.unauthorized_loader
    def unauthorized_callback(reason):
        return jsonify({"success": False, "data": None, "message": reason}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return jsonify({"success": False, "data": None, "message": reason}), 401

    @app.errorhandler(404)
    def not_found(error):
        if request.path.startswith("/api/"):
            return jsonify({"success": False, "data": None, "message": "Resource not found."}), 404
        return _serve_frontend(app)

    @app.errorhandler(500)
    def internal_server_error(error):
        logger.exception("Unhandled server error: %s", error)
        return jsonify({"success": False, "data": None, "message": "Internal server error."}), 500

    @app.get("/api/health")
    def health_check():
        return jsonify({"success": True, "data": {"status": "ok"}, "message": "Service healthy."})

    @app.get("/", defaults={"path": ""})
    @app.get("/<path:path>")
    def frontend(path: str):
        if path.startswith("api/"):
            return jsonify({"success": False, "data": None, "message": "Resource not found."}), 404
        return _serve_frontend(app, path)

    with app.app_context():
        db.create_all()
        _ensure_admin_seed(app)

    return app


def _ensure_admin_seed(app: Flask):
    admin_username = app.config["ADMIN_USERNAME"]
    if not admin_username:
        return

    existing_admin = User.query.filter_by(username=admin_username).first()
    if existing_admin is None:
        return

    if not existing_admin.is_admin:
        existing_admin.is_admin = True
        db.session.commit()


def _serve_frontend(app: Flask, path: str = ""):
    frontend_dist = Path(app.config["FRONTEND_DIST"])
    index_file = frontend_dist / "index.html"

    if index_file.exists():
        if path and (frontend_dist / path).exists():
            return send_from_directory(frontend_dist, path)
        return send_from_directory(frontend_dist, "index.html")

    if path:
        return jsonify({"success": False, "data": None, "message": "Frontend build not found."}), 404

    return jsonify(
        {
            "success": True,
            "data": {"service": "Personalized Medicine API"},
            "message": "Backend is running.",
        }
    )
