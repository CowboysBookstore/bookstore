"""Utility helpers for account operations."""

from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import Tuple
import jwt
from django.conf import settings

MCNEESE_PATTERN = re.compile(r"^[A-Za-z0-9._%+-]+@mcneese\.edu$")


def validate_mcneese_email(email: str) -> bool:
    if not email:
        return False
    return bool(MCNEESE_PATTERN.match(email.strip().lower()))


def _build_payload(sub: str, expires_delta: timedelta, token_type: str) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "sub": sub,
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
        "iss": settings.JWT_SETTINGS["ISSUER"],
        "aud": settings.JWT_SETTINGS["AUDIENCE"],
        "type": token_type,
    }


def generate_jwt_pair(subject: str) -> Tuple[str, str]:
    """Return (access_token, refresh_token)."""
    access_payload = _build_payload(
        subject,
        settings.JWT_SETTINGS["ACCESS_TOKEN_LIFETIME"],
        "access",
    )
    refresh_payload = _build_payload(
        subject,
        settings.JWT_SETTINGS["REFRESH_TOKEN_LIFETIME"],
        "refresh",
    )
    algorithm = settings.JWT_SETTINGS["ALGORITHM"]
    key = settings.JWT_SETTINGS["SIGNING_KEY"]
    access = jwt.encode(access_payload, key, algorithm=algorithm)
    refresh = jwt.encode(refresh_payload, key, algorithm=algorithm)
    return access, refresh
