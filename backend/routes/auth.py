from flask import Blueprint, current_app, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
    set_refresh_cookies,
    unset_jwt_cookies,
    unset_refresh_cookies,
)
from flask_wtf.csrf import generate_csrf
from werkzeug.security import check_password_hash, generate_password_hash

from backend.extensions import db, limiter
from backend.models import TokenBlocklist, User
from backend.utils import (
    clean_text,
    json_response,
    validate_password,
    validate_username,
)


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _create_auth_payload(user: User):
    access_token = create_access_token(identity=user.id, additional_claims={"username": user.username, "is_admin": user.is_admin})
    refresh_token = create_refresh_token(identity=user.id, additional_claims={"username": user.username, "is_admin": user.is_admin})
    return access_token, refresh_token, {"user": user.to_dict()}


@auth_bp.get("/csrf-token")
def csrf_token():
    return json_response(True, {"csrf_token": generate_csrf()}, "CSRF token generated.")


@auth_bp.post("/register")
@limiter.limit("3 per minute")
def register():
    payload = request.get_json(silent=True) or {}

    try:
        username = validate_username(payload.get("username"))
        password = validate_password(payload.get("password"))
        confirm_password = validate_password(payload.get("confirm_password"))
    except ValueError as exc:
        return json_response(False, None, str(exc), 400)

    if password != confirm_password:
        return json_response(False, None, "Password and confirmation do not match.", 400)

    if User.query.filter_by(username=username).first():
        return json_response(False, None, "Username is already taken.", 400)

    user = User(
        username=username,
        password_hash=generate_password_hash(password, method="pbkdf2:sha256"),
        is_admin=username == current_app.config["ADMIN_USERNAME"],
    )
    db.session.add(user)
    db.session.commit()

    access_token, refresh_token, user_payload = _create_auth_payload(user)
    response = json_response(True, {**user_payload, "access_token": access_token}, "Registration successful.", 201)
    set_refresh_cookies(response[0], refresh_token)
    return response


@auth_bp.post("/login")
@limiter.limit("5 per minute")
def login():
    payload = request.get_json(silent=True) or {}

    username = clean_text(payload.get("username"))
    password = clean_text(payload.get("password"))

    if not username or not password:
        return json_response(False, None, "Username and password are required.", 400)

    user = User.query.filter_by(username=username).first()
    if user is None or not check_password_hash(user.password_hash, password):
        return json_response(False, None, "Invalid username or password.", 401)

    access_token, refresh_token, user_payload = _create_auth_payload(user)
    response = json_response(True, {**user_payload, "access_token": access_token}, "Login successful.")
    set_refresh_cookies(response[0], refresh_token)
    return response


@auth_bp.post("/refresh")
@jwt_required(refresh=True, locations=["cookies"])
def refresh():
    user = db.session.get(User, get_jwt_identity())
    if user is None:
        return json_response(False, None, "User not found.", 404)

    access_token = create_access_token(identity=user.id, additional_claims={"username": user.username, "is_admin": user.is_admin})
    return json_response(True, {"access_token": access_token, "user": user.to_dict()}, "Token refreshed.")


@auth_bp.post("/logout")
@jwt_required(optional=True)
def logout():
    jwt_payload = get_jwt()
    if jwt_payload:
        db.session.add(
            TokenBlocklist(
                jti=jwt_payload.get("jti"),
                token_type=jwt_payload.get("type", "access"),
                user_id=get_jwt_identity(),
            )
        )
        db.session.commit()

    response = json_response(True, None, "Logout successful.")
    unset_refresh_cookies(response[0])
    unset_jwt_cookies(response[0])
    return response


@auth_bp.get("/me")
@jwt_required()
def me():
    user = db.session.get(User, get_jwt_identity())
    if user is None:
        return json_response(False, None, "User not found.", 404)
    return json_response(True, user.to_dict(), "Current user loaded.")
