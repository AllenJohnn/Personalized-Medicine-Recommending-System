from flask import Blueprint, current_app, request
from flask_jwt_extended import get_jwt_identity, jwt_required, verify_jwt_in_request

from backend.extensions import db, limiter
from backend.models import SearchHistory, User
from backend.services.recommender import (
    all_conditions,
    all_medicine_names,
    medicines_frame,
    medicine_detail,
    medicines_for_condition,
    recommend_alternatives,
)
from backend.utils import json_response, validate_medicine_name


medicines_bp = Blueprint("medicines", __name__, url_prefix="/api/medicines")


@medicines_bp.get("/")
def get_all_medicines():
    return json_response(True, all_medicine_names(current_app.config["CSV_PATH"]), "Medicine names loaded.")


@medicines_bp.post("/search")
@limiter.limit("30 per minute")
def search():
    payload = request.get_json(silent=True) or {}
    try:
        medicine_name = validate_medicine_name(payload.get("medicine_name"))
    except ValueError as exc:
        return json_response(False, None, str(exc), 400)

    results = recommend_alternatives(current_app.config["CSV_PATH"], medicine_name)
    if not results["matched_name"]:
        return json_response(False, None, "Medicine not found.", 404)

    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except Exception:
        user_id = None

    if user_id:
        user = db.session.get(User, user_id)
        if user is not None:
            db.session.add(
                SearchHistory(
                    user_id=user.id,
                    query=medicine_name,
                    result_count=len(results["results"]),
                )
            )
            db.session.commit()

    return json_response(
        True,
        {
            "searched_name": results["matched_name"],
            "results": results["results"],
        },
        "Search completed.",
    )


@medicines_bp.get("/<path:name>")
def get_medicine(name: str):
    try:
        medicine_name = validate_medicine_name(name, "name")
    except ValueError:
        medicine_name = name.strip()

    detail = medicine_detail(medicines_frame(current_app.config["CSV_PATH"]), medicine_name)
    if detail is None:
        return json_response(False, None, "Medicine not found.", 404)
    return json_response(True, detail, "Medicine detail loaded.")


@medicines_bp.get("/conditions")
def get_conditions():
    return json_response(True, all_conditions(current_app.config["CSV_PATH"]), "Conditions loaded.")


@medicines_bp.get("/conditions/<path:condition>")
def get_condition_medicines(condition: str):
    medicines = medicines_for_condition(condition, current_app.config["CSV_PATH"])
    if not medicines:
        return json_response(False, None, "Condition not found.", 404)
    return json_response(True, medicines, "Condition medicines loaded.")
