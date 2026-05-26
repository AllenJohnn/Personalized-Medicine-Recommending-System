from datetime import datetime, timezone

from backend.extensions import db


class TimestampMixin:
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))


class User(TimestampMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)

    histories = db.relationship("SearchHistory", backref="user", lazy=True, cascade="all, delete-orphan")
    bookmarks = db.relationship("Bookmark", backref="user", lazy=True, cascade="all, delete-orphan")
    requests = db.relationship("MedicineRequest", backref="requester", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "is_admin": self.is_admin,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class SearchHistory(TimestampMixin, db.Model):
    __tablename__ = "search_histories"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    query = db.Column(db.String(120), nullable=False)
    result_count = db.Column(db.Integer, nullable=False, default=0)
    searched_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "query": self.query,
            "result_count": self.result_count,
            "searched_at": self.searched_at.isoformat() if self.searched_at else None,
        }


class Bookmark(TimestampMixin, db.Model):
    __tablename__ = "bookmarks"
    __table_args__ = (db.UniqueConstraint("user_id", "medicine_name", name="uq_bookmark_user_medicine"),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    medicine_name = db.Column(db.String(200), nullable=False, index=True)
    saved_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "medicine_name": self.medicine_name,
            "saved_at": self.saved_at.isoformat() if self.saved_at else None,
        }


class MedicineRequest(TimestampMixin, db.Model):
    __tablename__ = "medicine_requests"

    id = db.Column(db.Integer, primary_key=True)
    medicine_name = db.Column(db.String(200), nullable=False, index=True)
    details = db.Column(db.Text, nullable=False)
    requested_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    username = db.Column(db.String(32), nullable=False, index=True)
    status = db.Column(db.String(20), nullable=False, default="pending", index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "medicine_name": self.medicine_name,
            "details": self.details,
            "requested_by": self.requested_by,
            "username": self.username,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class TokenBlocklist(TimestampMixin, db.Model):
    __tablename__ = "token_blocklist"

    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), unique=True, nullable=False, index=True)
    token_type = db.Column(db.String(20), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)

