import base64
from email.mime.text import MIMEText

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from config import config


def send_email(to_address: str, subject: str, body: str) -> dict:
    if not to_address:
        raise ValueError("to_address is required")

    if not all(
        [
            config.GOOGLE_CLIENT_ID,
            config.GOOGLE_CLIENT_SECRET,
            config.GMAIL_REFRESH_TOKEN,
            config.GMAIL_SENDER,
        ]
    ):
        raise RuntimeError("Gmail sender credentials are not fully configured")

    credentials = Credentials(
        token=None,
        refresh_token=config.GMAIL_REFRESH_TOKEN,
        token_uri=config.GOOGLE_TOKEN_URI,
        client_id=config.GOOGLE_CLIENT_ID,
        client_secret=config.GOOGLE_CLIENT_SECRET,
        scopes=["https://www.googleapis.com/auth/gmail.send"],
    )

    message = MIMEText(body)
    message["To"] = to_address
    message["From"] = config.GMAIL_SENDER
    message["Subject"] = subject

    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
    service = build("gmail", "v1", credentials=credentials)

    return (
        service.users()
        .messages()
        .send(userId="me", body={"raw": raw_message})
        .execute()
    )
