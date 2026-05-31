import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent

load_dotenv(ROOT_DIR / ".env")
load_dotenv(BASE_DIR / ".env")


class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

    GMAIL_SENDER = os.getenv("GMAIL_SENDER", "")
    GMAIL_REFRESH_TOKEN = os.getenv("GMAIL_REFRESH_TOKEN", "")

    FLASK_SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "dev-flask-secret")
    JWT_SECRET = os.getenv("JWT_SECRET", "dev-jwt-secret")

    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000").rstrip("/")

    GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token"
    GOOGLE_AUTH_SCOPES = [
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/gmail.send",
    ]


config = Config()

if config.BACKEND_URL.startswith("http://localhost") or config.BACKEND_URL.startswith("http://127.0.0.1"):
    os.environ.setdefault("OAUTHLIB_INSECURE_TRANSPORT", "1")
