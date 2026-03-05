import pytest
from django.contrib.auth import get_user_model
from django.core import mail
from rest_framework.test import APIClient

from accounts.models import ActivationCode, PasswordResetCode
from accounts.utils import validate_mcneese_email

User = get_user_model()


@pytest.fixture(autouse=True)
def _email_backend_settings(settings):
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    settings.JWT_SETTINGS["SIGNING_KEY"] = "test-signing-key"
    return settings


@pytest.fixture
def client():
    return APIClient()


@pytest.mark.django_db
def test_validate_mcneese_email():
    assert validate_mcneese_email("user@mcneese.edu") is True
    assert validate_mcneese_email("user@gmail.com") is False


@pytest.mark.django_db
def test_register_creates_inactive_user_and_sends_code(client):
    resp = client.post(
        "/api/auth/register/",
        {
            "first_name": "Pat",
            "last_name": "Rider",
            "email": "pat@mcneese.edu",
            "password": "Secretpass1",
        },
        format="json",
    )
    assert resp.status_code == 201
    user = User.objects.get(email="pat@mcneese.edu")
    assert user.is_active is False
    code = ActivationCode.objects.get(user=user)
    assert code.is_valid()
    assert len(mail.outbox) == 1
    assert code.code in mail.outbox[0].body


@pytest.mark.django_db
def test_activation_then_login_returns_tokens(client):
    # Register
    client.post(
        "/api/auth/register/",
        {
            "first_name": "Pat",
            "last_name": "Rider",
            "email": "pat@mcneese.edu",
            "password": "Secretpass1",
        },
        format="json",
    )
    user = User.objects.get(email="pat@mcneese.edu")
    code = ActivationCode.objects.get(user=user)

    # Verify activation
    verify_resp = client.post(
        "/api/auth/verify/",
        {"email": user.email, "code": code.code},
        format="json",
    )
    assert verify_resp.status_code == 200
    user.refresh_from_db()
    assert user.is_active is True
    code.refresh_from_db()
    assert code.used is True

    # Login
    login_resp = client.post(
        "/api/auth/login/",
        {"email": user.email, "password": "Secretpass1"},
        format="json",
    )
    assert login_resp.status_code == 200
    tokens = login_resp.json()
    assert "access" in tokens and "refresh" in tokens


@pytest.mark.django_db
def test_forgot_and_reset_password_flow(client):
    user = User.objects.create_user(
        email="river@mcneese.edu",
        first_name="River",
        last_name="Smith",
        is_active=True,
    )
    user.set_password("Oldpass1!")
    user.save()

    forgot_resp = client.post(
        "/api/auth/forgot-password/",
        {"email": user.email},
        format="json",
    )
    assert forgot_resp.status_code == 200
    reset_code = PasswordResetCode.objects.get(user=user)
    assert reset_code.is_valid()
    assert len(mail.outbox) >= 1

    reset_resp = client.post(
        "/api/auth/reset-password/",
        {"email": user.email, "code": reset_code.code, "new_password": "Newpass1!"},
        format="json",
    )
    assert reset_resp.status_code == 200

    login_resp = client.post(
        "/api/auth/login/",
        {"email": user.email, "password": "Newpass1!"},
        format="json",
    )
    assert login_resp.status_code == 200
    tokens = login_resp.json()
    assert "access" in tokens
    reset_code.refresh_from_db()
    assert reset_code.used is True
