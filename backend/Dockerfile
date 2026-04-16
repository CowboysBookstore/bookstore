FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# copy requirements and install
COPY requirements.txt .
RUN pip install --upgrade pip setuptools && \
    pip install --no-cache-dir -r requirements.txt

# copy app code
COPY . .

# collect static files
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# Use gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--worker-class", "sync", "--timeout", "120", "core.wsgi:application"]
