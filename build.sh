#!/usr/bin/env bash
# exit on error
set -o errexit

echo "[build.sh] starting $(date)"
echo "[build.sh] python=$(python --version 2>/dev/null || true)"

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Option A (not required, but nice): Django's built-in createsuperuser automation.
# This works in many setups when DJANGO_SUPERUSER_* vars are present.
if [[ -n "${DJANGO_SUPERUSER_EMAIL:-}" && -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]]; then
	echo "[build.sh] attempting createsuperuser via DJANGO_SUPERUSER_* env vars"
	python manage.py createsuperuser --noinput || true
else
	echo "[build.sh] DJANGO_SUPERUSER_* vars not set; skipping built-in createsuperuser automation"
fi

# Option B (authoritative for this repo): ensure the admin user via ORM for our custom User model.
if [[ -n "${SUPERUSER_EMAIL:-}" && -n "${SUPERUSER_PASSWORD:-}" ]]; then
	echo "[build.sh] ensuring superuser via ORM for ${SUPERUSER_EMAIL}"
	python manage.py shell -c "
import os
from django.contrib.auth import get_user_model

User = get_user_model()

email = os.environ['SUPERUSER_EMAIL']
password = os.environ['SUPERUSER_PASSWORD']
first_name = os.environ.get('SUPERUSER_FIRST_NAME', 'Admin')
last_name = os.environ.get('SUPERUSER_LAST_NAME', 'User')

user, created = User.objects.get_or_create(
	email=email,
	defaults={
		'first_name': first_name,
		'last_name': last_name,
		'is_staff': True,
		'is_superuser': True,
		'is_active': True,
	},
)

changed_fields = []
if user.first_name != first_name:
	user.first_name = first_name
	changed_fields.append('first_name')
if user.last_name != last_name:
	user.last_name = last_name
	changed_fields.append('last_name')

if not user.is_staff:
	user.is_staff = True
	changed_fields.append('is_staff')
if not user.is_superuser:
	user.is_superuser = True
	changed_fields.append('is_superuser')
if not user.is_active:
	user.is_active = True
	changed_fields.append('is_active')

user.set_password(password)
changed_fields.append('password')

user.save(update_fields=changed_fields or None)

print('Superuser ensured:', user.email, '| created=' + str(created), '| updated_fields=' + ','.join(changed_fields))
"
else
	echo "[build.sh] SUPERUSER_EMAIL/SUPERUSER_PASSWORD not set; skipping ORM ensure step."
fi

# One more collectstatic is harmless and matches common Render build patterns.
python manage.py collectstatic --no-input

echo "[build.sh] finished $(date)"
