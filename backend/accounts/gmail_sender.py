from __future__ import annotations

import base64
import json
import os
from email.message import EmailMessage
from typing import Iterable

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


GMAIL_SEND_SCOPES = ["https://www.googleapis.com/auth/gmail.send"]


def _load_gmail_credentials() -> Credentials:
    """Load Gmail OAuth credentials from environment variables.

    Required env vars:
      - GMAIL_CLIENT_ID
      - GMAIL_CLIENT_SECRET
      - GMAIL_REFRESH_TOKEN

    Optional:
      - GMAIL_TOKEN_URI (default: https://oauth2.googleapis.com/token)
    """

    client_id = os.getenv("GMAIL_CLIENT_ID", "").strip()
    client_secret = os.getenv("GMAIL_CLIENT_SECRET", "").strip()
    refresh_token = os.getenv("GMAIL_REFRESH_TOKEN", "").strip()
    token_uri = os.getenv("GMAIL_TOKEN_URI", "https://oauth2.googleapis.com/token").strip()

    missing = [k for k, v in {
        "GMAIL_CLIENT_ID": client_id,
        "GMAIL_CLIENT_SECRET": client_secret,
        "GMAIL_REFRESH_TOKEN": refresh_token,
    }.items() if not v]
    if missing:
        raise RuntimeError(f"Missing Gmail OAuth env vars: {', '.join(missing)}")

    creds = Credentials(
        None,
        refresh_token=refresh_token,
        token_uri=token_uri,
        client_id=client_id,
        client_secret=client_secret,
        scopes=GMAIL_SEND_SCOPES,
    )

    # Ensure an access token is available.
    creds.refresh(Request())
    return creds


def send_gmail_message(
    *,
    from_email: str,
    from_name: str | None,
    to_emails: Iterable[str],
    subject: str,
    plain: str,
    html: str,
    reply_to: str | None = None,
) -> None:
    creds = _load_gmail_credentials()

    msg = EmailMessage()
    if from_name:
        msg["From"] = f"{from_name} <{from_email}>"
    else:
        msg["From"] = from_email

    msg["To"] = ", ".join(list(to_emails))
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to

    # multipart/alternative
    msg.set_content(plain)
    msg.add_alternative(html, subtype="html")

    encoded = base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")

    service = build("gmail", "v1", credentials=creds, cache_discovery=False)
    # "me" sends as the authenticated user.
    resp = service.users().messages().send(userId="me", body={"raw": encoded}).execute()

    # resp contains id/threadId. We don't need it but keep basic sanity check.
    if not resp or "id" not in resp:
        raise RuntimeError(f"Unexpected Gmail API response: {json.dumps(resp)[:500]}")
