from __future__ import annotations

from typing import Optional, Tuple

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions

User = get_user_model()


class JWTAuthentication(authentication.BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request) -> Optional[Tuple[User, None]]:
        auth_header = authentication.get_authorization_header(request).decode("utf-8")
        if not auth_header or not auth_header.startswith(f"{self.keyword} "):
            return None
        token = auth_header.split(" ", 1)[1].strip()
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SETTINGS["SIGNING_KEY"],
                algorithms=[settings.JWT_SETTINGS["ALGORITHM"]],
                audience=settings.JWT_SETTINGS["AUDIENCE"],
                issuer=settings.JWT_SETTINGS["ISSUER"],
            )
        except jwt.ExpiredSignatureError as exc:
            raise exceptions.AuthenticationFailed("Token expired") from exc
        except jwt.InvalidTokenError as exc:
            raise exceptions.AuthenticationFailed("Invalid token") from exc

        user_id = payload.get("sub")
        token_type = payload.get("type")
        if token_type != "access":
            raise exceptions.AuthenticationFailed("Invalid token type")
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist as exc:
            raise exceptions.AuthenticationFailed("User not found") from exc
        if not user.is_active:
            raise exceptions.AuthenticationFailed("User inactive")
        return user, None
