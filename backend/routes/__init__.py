from backend.routes.admin import admin_bp
from backend.routes.auth import auth_bp
from backend.routes.medicines import medicines_bp
from backend.routes.requests import requests_bp
from backend.routes.user import user_bp


__all__ = ["admin_bp", "auth_bp", "medicines_bp", "requests_bp", "user_bp"]
