# Cowboy Online Bookstore

Authentication system for the McNeese State University campus bookstore.

## Stack

| Layer    | Tech                                          |
| -------- | --------------------------------------------- |
| Backend  | Python 3.11, Django 4.2, Django REST, PyJWT   |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS      |
| Database | SQLite (dev) — MySQL/Postgres planned for prod |

## Project layout

```
bookstore/
├── backend/          Django project + accounts app (models, views, serializers, JWT, tests)
├── frontend/         Vite React + TypeScript + Tailwind (auth pages, components, tests)
├── .env.example      Template for secrets — copy to .env and fill in
├── .github/workflows CI pipelines (lint + test for backend and frontend)

## Getting started — quick and reliable (few commands)

These instructions get a developer up and running quickly without surprises. They cover both Docker and local developer flows. The app uses SQLite for development so you don't need a separate DB service.

Prereqs
- Docker Desktop (macOS / Windows) OR
- Python 3.11+ and Node 18+ (if running locally)

1) Clone the repo

```zsh
git clone https://github.com/CowboysBookstore/bookstore.git
cd bookstore
```

2) Copy the env template and edit (required)

```zsh
cp .env.example .env
# Open .env and set at least DJANGO_SECRET_KEY. Optionally set EMAIL_* and STRIPE_* for SMTP/Stripe tests.
```

Quick start — Docker (recommended)

```zsh
# build and start backend + frontend (first run may take a minute)
docker compose up --build
```

What this does
- Runs migrations automatically for the backend.
- Serves backend on http://localhost:8000 and frontend on http://localhost:5173 (Vite dev server + proxy).

Seed the product catalog (one-time)

```zsh
# in a separate terminal (or inside the backend container)
docker compose exec backend python manage.py seed_products
```

Optional: create a superuser inside the backend container

```zsh
docker compose exec backend python manage.py createsuperuser
```

Shutting down

```zsh
docker compose down
```

Local dev (no Docker)

Backend

```zsh
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env
# edit ../.env
python manage.py migrate
python manage.py seed_products
python manage.py runserver 0.0.0.0:8000
```

Frontend (separate terminal)

```zsh
cd frontend
npm ci
npm run dev -- --host 0.0.0.0
```

Notes and troubleshooting
- If the frontend doesn't show backend data, restart the frontend dev server so Vite picks up `vite.config.ts` (the dev proxy). Stop the server and run `npm run dev` again.
- If you get CORS or 401 errors when calling `/api`, open DevTools Network and share the request/response — I'll help diagnose quickly.
- Email: by default verification/reset codes print to the backend terminal. To enable real emails, set `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend` and fill SMTP fields in `.env`.

Running tests

```bash
# Backend (from repo/backend, with venv active)
cd backend && pytest

# Frontend (from repo/frontend)
cd frontend && npm run test
```
cd backend && pytest

# Frontend (from repo root)
cd frontend && npm run test
```

## Code style

```bash
# Check Python formatting
cd backend && black --check .

# Auto-format Python
cd backend && black .

# Lint frontend
cd frontend && npm run lint
```

---

## Auth API endpoints

All endpoints are under `/api/auth/`.

| Method | Path                     | Body                                              | Description                         |
| ------ | ------------------------ | ------------------------------------------------- | ----------------------------------- |
| POST   | `/api/auth/register/`    | first_name, last_name, email, password            | Register (only @mcneese.edu emails) |
| POST   | `/api/auth/verify/`      | email, code                                       | Verify account with 6-digit code    |
| POST   | `/api/auth/login/`       | email, password                                   | Returns JWT access + refresh tokens |
| POST   | `/api/auth/forgot-password/` | email                                          | Sends a 6-digit reset code via email |
| POST   | `/api/auth/reset-password/`  | email, code, new_password                      | Resets the password                  |

## Email in development

Set `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend` in `.env` and fill in SMTP credentials to send real emails. Otherwise codes only print in the Django terminal.

## CI

GitHub Actions run on every push and PR:

- **Backend CI** — `black --check` + `pytest`
- **Frontend CI** — `eslint` + `vitest`
