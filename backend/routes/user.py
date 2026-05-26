from flask import Blueprint, current_app, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from backend.extensions import db
from backend.models import Bookmark, SearchHistory, User
from backend.utils import json_response, validate_medicine_name


user_bp = Blueprint("user", __name__, url_prefix="/api/user")


@user_bp.get("/history")
@jwt_required()
def history():
    user = db.session.get(User, get_jwt_identity())
    if user is None:
        return json_response(False, None, "User not found.", 404)

    items = (
        SearchHistory.query.filter_by(user_id=user.id)
        .order_by(SearchHistory.searched_at.desc())
        .limit(20)
        .all()
    )
    return json_response(True, [item.to_dict() for item in items], "History loaded.")


@user_bp.delete("/history")
@jwt_required()
def clear_history():
    user = db.session.get(User, get_jwt_identity())
    if user is None:
        return json_response(False, None, "User not found.", 404)

    SearchHistory.query.filter_by(user_id=user.id).delete()
    db.session.commit()
    return json_response(True, None, "History cleared.")


@user_bp.get("/bookmarks")
@jwt_required()
def bookmarks():
    user = db.session.get(User, get_jwt_identity())
    if user is None:
        return json_response(False, None, "User not found.", 404)

    items = Bookmark.query.filter_by(user_id=user.id).order_by(Bookmark.saved_at.desc()).all()
    return json_response(True, [item.to_dict() for item in items], "Bookmarks loaded.")


@user_bp.post("/bookmarks")
@jwt_required()
def add_bookmark():
    user = db.session.get(User, get_jwt_identity())
    if user is None:
        return json_response(False, None, "User not found.", 404)

    payload = request.get_json(silent=True) or {}
    try:
        medicine_name = validate_medicine_name(payload.get("medicine_name"))
    except ValueError as exc:
        return json_response(False, None, str(exc), 400)

    bookmark = Bookmark.query.filter_by(user_id=user.id, medicine_name=medicine_name).first()
    if bookmark is None:
        bookmark = Bookmark(user_id=user.id, medicine_name=medicine_name)
        db.session.add(bookmark)
        db.session.commit()

    return json_response(True, bookmark.to_dict(), "Bookmark saved.", 201)


@user_bp.delete("/bookmarks/<path:name>")
@jwt_required()
def remove_bookmark(name: str):
    user = db.session.get(User, get_jwt_identity())
    if user is None:
        return json_response(False, None, "User not found.", 404)

    bookmark = Bookmark.query.filter_by(user_id=user.id, medicine_name=name).first()
    if bookmark is None:
        return json_response(False, None, "Bookmark not found.", 404)

    db.session.delete(bookmark)
    db.session.commit()
    return json_response(True, None, "Bookmark removed.")
