import smtplib
import ssl
from email.message import EmailMessage

from config import config


def send_email(to_address: str, subject: str, body: str) -> None:
    if not to_address:
        raise ValueError("to_address is required")

    if not config.GMAIL_SENDER or not config.GMAIL_APP_PASSWORD:
        raise RuntimeError("GMAIL_SENDER and GMAIL_APP_PASSWORD must be configured")

    message = EmailMessage()
    message["To"] = to_address
    message["From"] = config.GMAIL_SENDER
    message["Subject"] = subject
    message.set_content(body)

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(config.GMAIL_SENDER, config.GMAIL_APP_PASSWORD)
        server.send_message(message)
