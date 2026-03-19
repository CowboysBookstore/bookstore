#!/usr/bin/env sh
set -e

# Wait a short time for any linked services (if used). For SQLite this is not required
sleep 1

echo "Collecting static files (skip if not configured)..."
if [ -f manage.py ]; then
  # Apply migrations
  echo "Running migrations..."
  python manage.py migrate --noinput || true


  # Start Django dev server
  echo "Starting Django development server on 0.0.0.0:8000"
  exec python manage.py runserver 0.0.0.0:8000
else
  echo "manage.py not found; sleeping..."
  sleep infinity
fi
