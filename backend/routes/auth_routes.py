from urllib.parse import urlencode

from flask import Blueprint, jsonify, redirect, request

from auth import create_session_token
from config import config
from data.users import upsert_user
from services.google_profile import build_google_flow, fetch_google_profile


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.get("/login")
def login():
    flow = build_google_flow()
    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    return redirect(authorization_url)


@auth_bp.get("/callback")
def auth_callback():
    if "error" in request.args:
        return redirect_frontend_error(request.args["error"])

    code = request.args.get("code")
    if not code:
        return jsonify({"error": "Missing authorization code"}), 400

    flow = build_google_flow()
    flow.fetch_token(code=code)

    profile = fetch_google_profile(flow.credentials)
    user = upsert_user(profile)
    token = create_session_token(user)

    return redirect(f"{config.FRONTEND_URL}/auth/callback?{urlencode({'token': token})}")


def redirect_frontend_error(error: str):
    return redirect(f"{config.FRONTEND_URL}/auth/callback?{urlencode({'error': error})}")
