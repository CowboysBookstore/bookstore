"""WSGI config for backend project."""

from __future__ import annotations

import os
import sys
import logging

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")


def _startup_marker() -> None:
	"""Emit one clear line in runtime logs to confirm what's running.

	This intentionally does NOT print secrets (passwords/keys). It only prints
	the presence of specific env vars so we can debug Render config.
	"""

	logger = logging.getLogger("django")
	enabled = os.getenv("ENABLE_RUNTIME_SUPERUSER_ENSURE", "false").lower() == "true"
	email_present = bool(
		os.getenv("SUPERUSER_EMAIL")
		or os.getenv("DJANGO_SUPERUSER_EMAIL")
	)
	password_present = bool(
		os.getenv("SUPERUSER_PASSWORD")
		or os.getenv("DJANGO_SUPERUSER_PASSWORD")
	)

	# Try to include commit sha if present (Render/Git providers sometimes expose it).
	sha = (
		os.getenv("RENDER_GIT_COMMIT")
		or os.getenv("GIT_COMMIT")
		or os.getenv("COMMIT_SHA")
		or "unknown"
	)

	logger.warning(
		"[wsgi-start] pid=%s sha=%s ENABLE_RUNTIME_SUPERUSER_ENSURE=%s email_present=%s password_present=%s",
		os.getpid(),
		sha,
		enabled,
		email_present,
		password_present,
	)
	# Also print to stdout as a fallback in case logging isn't configured yet.
	print(
		f"[wsgi-start] pid={os.getpid()} sha={sha} ENABLE_RUNTIME_SUPERUSER_ENSURE={enabled} "
		f"email_present={email_present} password_present={password_present}",
		file=sys.stdout,
		flush=True,
	)


_startup_marker()
application = get_wsgi_application()
