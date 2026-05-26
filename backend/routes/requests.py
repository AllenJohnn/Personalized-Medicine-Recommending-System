from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from backend.extensions import db
from backend.models import MedicineRequest, User
from backend.utils import json_response, validate_details, validate_medicine_name


requests_bp = Blueprint("requests", __name__, url_prefix="/api/requests")


@requests_bp.post("/")
@jwt_required()
def submit_request():
    payload = request.get_json(silent=True) or {}
    try:
        medicine_name = validate_medicine_name(payload.get("medicine_name"))
        details = validate_details(payload.get("details"), min_length=20, max_length=2000)
    except ValueError as exc:
        return json_response(False, None, str(exc), 400)

    user = db.session.get(User, get_jwt_identity())
    if user is None:
        return json_response(False, None, "User not found.", 404)

    medicine_request = MedicineRequest(
        medicine_name=medicine_name,
        details=details,
        requested_by=user.id,
        username=user.username,
    )
    db.session.add(medicine_request)
    db.session.commit()

    return json_response(True, medicine_request.to_dict(), "Request submitted.", 201)
