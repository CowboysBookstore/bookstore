from __future__ import annotations

from django.conf import settings
from django.core.mail import send_mail


def send_activation_email(email: str, code: str) -> None:
    subject = "Cowboy Bookstore — Your verification code"
    message = (
        f"Welcome to Cowboy Bookstore!\n\n"
        f"Your 6-digit verification code is:\n\n"
        f"    {code}\n\n"
        f"Enter this code on the verification page to activate your account.\n"
        f"This code expires in 24 hours.\n\n"
        f"If you didn't create an account, you can safely ignore this email.\n\n"
        f"— Cowboy Bookstore Team"
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=False)


def send_password_reset_email(email: str, code: str) -> None:
    subject = "Cowboy Bookstore — Your password reset code"
    message = (
        f"We received a request to reset your password.\n\n"
        f"Your 6-digit reset code is:\n\n"
        f"    {code}\n\n"
        f"Enter this code on the reset page to set a new password.\n"
        f"This code expires in 24 hours.\n\n"
        f"If you didn't request this, you can safely ignore this email.\n\n"
        f"— Cowboy Bookstore Team"
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=False)
