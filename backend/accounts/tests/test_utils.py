import jwt
import pytest
from django.conf import settings

from accounts.utils import generate_jwt_pair, validate_mcneese_email


def test_validate_mcneese_email_accepts_school_domain():
    assert validate_mcneese_email("student@mcneese.edu") is True


def test_validate_mcneese_email_rejects_other_domains():
    assert validate_mcneese_email("student@gmail.com") is False
    assert validate_mcneese_email("") is False


def test_generate_jwt_pair_has_access_and_refresh():
    access, refresh = generate_jwt_pair("user-123")
    assert access != refresh
    decoded_access = jwt.decode(
        access,
        settings.JWT_SETTINGS["SIGNING_KEY"],
        algorithms=[settings.JWT_SETTINGS["ALGORITHM"]],
        audience=settings.JWT_SETTINGS["AUDIENCE"],
        issuer=settings.JWT_SETTINGS["ISSUER"],
    )
    decoded_refresh = jwt.decode(
        refresh,
        settings.JWT_SETTINGS["SIGNING_KEY"],
        algorithms=[settings.JWT_SETTINGS["ALGORITHM"]],
        audience=settings.JWT_SETTINGS["AUDIENCE"],
        issuer=settings.JWT_SETTINGS["ISSUER"],
    )
    assert decoded_access["type"] == "access"
    assert decoded_refresh["type"] == "refresh"
    assert decoded_access["sub"] == "user-123"
    assert decoded_refresh["sub"] == "user-123"
