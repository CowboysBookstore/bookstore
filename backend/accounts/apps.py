from django.apps import AppConfig


def _maybe_ensure_superuser() -> None:
    """Ensure a superuser exists/updated at runtime when explicitly enabled.

    Why:
      - Some hosts only surface runtime logs.
      - Build logs may be unavailable.
      - This makes superuser provisioning observable via a single log line.

    Controlled by env var:
      - ENABLE_RUNTIME_SUPERUSER_ENSURE=true

    Required inputs (either convention works):
      - SUPERUSER_EMAIL + SUPERUSER_PASSWORD
        or
      - DJANGO_SUPERUSER_EMAIL + DJANGO_SUPERUSER_PASSWORD

    Optional:
      - SUPERUSER_FIRST_NAME / SUPERUSER_LAST_NAME
    """

    import logging
    import os

    logger = logging.getLogger("accounts")

    enabled = os.getenv("ENABLE_RUNTIME_SUPERUSER_ENSURE", "false").lower() == "true"
    if not enabled:
        return

    email = os.getenv("SUPERUSER_EMAIL") or os.getenv("DJANGO_SUPERUSER_EMAIL")
    password = os.getenv("SUPERUSER_PASSWORD") or os.getenv("DJANGO_SUPERUSER_PASSWORD")
    if not email or not password:
        logger.warning(
            "[runtime-superuser] enabled but SUPERUSER_EMAIL/SUPERUSER_PASSWORD (or DJANGO_SUPERUSER_*) not set; skipping"
        )
        return

    first_name = os.getenv("SUPERUSER_FIRST_NAME", "Admin")
    last_name = os.getenv("SUPERUSER_LAST_NAME", "User")

    try:
        from django.contrib.auth import get_user_model

        User = get_user_model()
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": first_name,
                "last_name": last_name,
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            },
        )

        changed_fields: list[str] = []
        if user.first_name != first_name:
            user.first_name = first_name
            changed_fields.append("first_name")
        if user.last_name != last_name:
            user.last_name = last_name
            changed_fields.append("last_name")
        if not user.is_staff:
            user.is_staff = True
            changed_fields.append("is_staff")
        if not user.is_superuser:
            user.is_superuser = True
            changed_fields.append("is_superuser")
        if not user.is_active:
            user.is_active = True
            changed_fields.append("is_active")

        user.set_password(password)
        changed_fields.append("password")

        user.save(update_fields=changed_fields or None)

        logger.warning(
            "[runtime-superuser] ensured email=%s created=%s updated_fields=%s",
            user.email,
            created,
            ",".join(changed_fields),
        )
    except Exception:
        logger.exception("[runtime-superuser] failed")


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"

    def ready(self) -> None:
        _maybe_ensure_superuser()
