from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import g, jsonify, request

from config import config


def create_session_token(user: dict) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user["id"],
        "email": user["email"],
        "name": user.get("name"),
        "iat": now,
        "exp": now + timedelta(days=7),
    }
    return jwt.encode(payload, config.JWT_SECRET, algorithm="HS256")


def require_auth(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        scheme, _, token = auth_header.partition(" ")

        if scheme.lower() != "bearer" or not token:
            return jsonify({"error": "Missing bearer token"}), 401

        try:
            payload = jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        g.current_user = {
            "id": payload["sub"],
            "email": payload.get("email"),
            "name": payload.get("name"),
        }
        return view(*args, **kwargs)

    return wrapped
