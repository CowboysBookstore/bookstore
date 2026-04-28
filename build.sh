#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Map DJANGO_* vars into our custom email-based user model inputs.
# Note: this project does NOT have a username field; login is by email.
DJANGO_SU_EMAIL="${DJANGO_SUPERUSER_EMAIL:-${DJANGO_SUPERUSER_NAME:-}}"
DJANGO_SU_PASSWORD="${DJANGO_SUPERUSER_PASSWORD:-}"

if [[ -n "${DJANGO_SU_EMAIL}" && -n "${DJANGO_SU_PASSWORD}" ]]; then
	export SUPERUSER_EMAIL="${DJANGO_SU_EMAIL}"
	export SUPERUSER_PASSWORD="${DJANGO_SU_PASSWORD}"
	export SUPERUSER_FIRST_NAME="${DJANGO_SUPERUSER_FIRST_NAME:-Admin}"
	export SUPERUSER_LAST_NAME="${DJANGO_SUPERUSER_LAST_NAME:-User}"

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

print('Superuser ensured')
"
else
	echo "Superuser not configured: set DJANGO_SUPERUSER_PASSWORD and (DJANGO_SUPERUSER_EMAIL or DJANGO_SUPERUSER_NAME)"
fi
