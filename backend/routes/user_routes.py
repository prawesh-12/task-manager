from flask import Blueprint, jsonify

from auth import require_auth
from data.users import list_users


users_bp = Blueprint("users", __name__)


@users_bp.get("/users")
@require_auth
def get_users():
    return jsonify({"users": list_users()})
