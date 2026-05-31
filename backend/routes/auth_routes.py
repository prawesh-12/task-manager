from urllib.parse import urlencode

from flask import Blueprint, jsonify, redirect, request, session

from auth import create_session_token
from config import config
from data.users import upsert_user
from services.google_profile import build_google_flow, fetch_google_profile


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.get("/login")
def login():
    flow = build_google_flow()
    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    session["google_oauth_state"] = state
    session["google_oauth_code_verifier"] = flow.code_verifier
    return redirect(authorization_url)


@auth_bp.get("/callback")
def auth_callback():
    if "error" in request.args:
        return redirect_frontend_error(request.args["error"])

    code = request.args.get("code")
    if not code:
        return jsonify({"error": "Missing authorization code"}), 400

    state = request.args.get("state")
    expected_state = session.pop("google_oauth_state", None)
    code_verifier = session.pop("google_oauth_code_verifier", None)

    if not state or state != expected_state or not code_verifier:
        return redirect_frontend_error("invalid_oauth_state")

    flow = build_google_flow(state=state, code_verifier=code_verifier)
    flow.fetch_token(code=code)

    profile = fetch_google_profile(flow.credentials)
    user = upsert_user(profile)
    token = create_session_token(user)

    return redirect(f"{config.FRONTEND_URL}/auth/callback?{urlencode({'token': token})}")


def redirect_frontend_error(error: str):
    return redirect(f"{config.FRONTEND_URL}/auth/callback?{urlencode({'error': error})}")
