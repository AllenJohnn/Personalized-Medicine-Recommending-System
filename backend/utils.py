from __future__ import annotations

import re
from functools import wraps
from typing import Any, Callable

from flask import jsonify
from flask_jwt_extended import get_jwt_identity

from backend.extensions import db
from backend.models import User


USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_]{3,32}$")
MEDICINE_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9 .,'()/%+-]{1,199}$")


def json_response(success: bool, data: Any = None, message: str = "", status_code: int = 200):
    return jsonify({"success": success, "data": data, "message": message}), status_code


def validation_error(message: str, status_code: int = 400):
    return json_response(False, None, message, status_code)


def clean_text(value: Any) -> str:
    return str(value or "").strip()


def validate_username(username: str) -> str:
    username = clean_text(username)
    if not USERNAME_PATTERN.match(username):
        raise ValueError("Username must be 3 to 32 characters and use letters, numbers, or underscores.")
    return username


def validate_password(password: str) -> str:
    password = clean_text(password)
    if len(password) < 8 or len(password) > 128:
        raise ValueError("Password must be between 8 and 128 characters.")
    return password


def validate_medicine_name(name: str, field_name: str = "medicine_name") -> str:
    name = clean_text(name)
    if len(name) < 2 or len(name) > 200:
        raise ValueError(f"{field_name} must be between 2 and 200 characters.")
    if not MEDICINE_PATTERN.match(name):
        raise ValueError(f"{field_name} contains invalid characters.")
    return name


def validate_details(details: str, field_name: str = "details", min_length: int = 10, max_length: int = 1000) -> str:
    details = clean_text(details)
    if len(details) < min_length or len(details) > max_length:
        raise ValueError(f"{field_name} must be between {min_length} and {max_length} characters.")
    return details


def get_current_user() -> User | None:
    identity = get_jwt_identity()
    if not identity:
        return None
    return db.session.get(User, identity)


def admin_required(view_func: Callable):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if user is None:
            return validation_error("Authentication required.", 401)
        if not user.is_admin:
            return validation_error("Admin access required.", 403)
        return view_func(user, *args, **kwargs)

    return wrapper
