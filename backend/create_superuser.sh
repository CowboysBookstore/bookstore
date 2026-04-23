#!/usr/bin/env bash
# exit on error
set -o errexit

python manage.py createsuperuser --noinput --username "admin" --email "admin@mcneese.edu" || true
(echo "admin123"; echo "admin123") | python manage.py changepassword "admin" || true
