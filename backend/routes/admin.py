from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from backend.extensions import db
from backend.models import MedicineRequest, SearchHistory, User
from backend.utils import admin_required, json_response


admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.get("/requests")
@jwt_required()
@admin_required
def get_requests(current_user):
    items = MedicineRequest.query.order_by(MedicineRequest.created_at.desc()).all()
    return json_response(True, [item.to_dict() for item in items], "Requests loaded.")


@admin_bp.patch("/requests/<int:request_id>")
@jwt_required()
@admin_required
def update_request(current_user, request_id: int):
    payload = request.get_json(silent=True) or {}
    status = str(payload.get("status", "")).strip().lower()
    if status not in {"approved", "rejected"}:
        return json_response(False, None, "Status must be approved or rejected.", 400)

    medicine_request = db.session.get(MedicineRequest, request_id)
    if medicine_request is None:
        return json_response(False, None, "Request not found.", 404)

    medicine_request.status = status
    db.session.commit()
    return json_response(True, medicine_request.to_dict(), "Request updated.")


@admin_bp.get("/stats")
@jwt_required()
@admin_required
def stats(current_user):
    total_users = db.session.query(User).count()
    total_searches = db.session.query(SearchHistory).count()
    pending_requests = MedicineRequest.query.filter_by(status="pending").count()
    return json_response(
        True,
        {
            "total_users": total_users,
            "total_searches": total_searches,
            "pending_requests": pending_requests,
        },
        "Stats loaded.",
    )
