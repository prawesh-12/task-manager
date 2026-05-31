from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

from config import config


def build_google_flow(state: str | None = None, code_verifier: str | None = None) -> Flow:
    callback_url = f"{config.BACKEND_URL}/auth/callback"
    client_config = {
        "web": {
            "client_id": config.GOOGLE_CLIENT_ID,
            "client_secret": config.GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": config.GOOGLE_TOKEN_URI,
            "redirect_uris": [callback_url],
        }
    }
    return Flow.from_client_config(
        client_config,
        scopes=config.GOOGLE_AUTH_SCOPES,
        redirect_uri=callback_url,
        state=state,
        code_verifier=code_verifier,
    )


def fetch_google_profile(credentials) -> dict:
    service = build("people", "v1", credentials=credentials)
    profile = (
        service.people()
        .get(resourceName="people/me", personFields="names,emailAddresses")
        .execute()
    )

    email = _first_item(profile.get("emailAddresses", []), "value")
    name = _first_item(profile.get("names", []), "displayName") or email
    google_id = profile.get("resourceName", "").replace("people/", "")

    if not email or not google_id:
        raise RuntimeError("Google profile did not include email or id")

    return {
        "email": email,
        "name": name,
        "google_id": google_id,
    }


def _first_item(items: list[dict], key: str):
    if not items:
        return None

    primary = next((item for item in items if item.get("metadata", {}).get("primary")), None)
    return (primary or items[0]).get(key)
