# Cowboy Online Bookstore (Phase 1: Auth-first)

Local-only authentication scaffold for the McNeese Bookstore project.

## Stack
- Backend: Python, Django 4.2, Django REST Framework, PyJWT
- Frontend: React + TypeScript (Vite) with Tailwind
- Database: SQLite for development (built-in). Plan: add MySQL/Postgres config later for prod.

## Project layout
- `backend/` – Django project with `accounts` app handling auth (models, views, serializers, JWT). Tests via `pytest`.
- `frontend/` – Vite React + TS + Tailwind app with tabbed auth UI (register, verify, login, forgot/reset password).
- `.env.example` – copy to `.env` and fill in secrets; `.gitignore` keeps the real `.env` out of git.

## Running locally

### 1. Backend (Django API) — http://localhost:8000
```bash
cd backend
source ../.venv/bin/activate     # or create: python -m venv ../.venv && source ../.venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
The API runs at **http://localhost:8000**. Auth endpoints are under `/api/auth/`.

Activation & reset codes print directly in the Django terminal (console email backend).

### 2. Frontend (React) — http://localhost:5173
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser. The UI talks to the backend at `localhost:8000`.

### 3. Run tests
```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm run test
```

### Ports summary
| Service | URL |
|---|---|
| Backend API | http://localhost:8000 |
| Frontend UI | http://localhost:5173 |

### Auth API (current)
- `POST /api/auth/register/` — first_name, last_name, email (@mcneese.edu only), password, banner_id. Creates inactive user and prints a 24h activation code to the Django terminal.
- `POST /api/auth/verify/` — email + code. Activates the account.
- `POST /api/auth/login/` — email + password. Returns JWT access/refresh tokens.
- `POST /api/auth/forgot-password/` — email. Prints a 24h reset code to the Django terminal.
- `POST /api/auth/reset-password/` — email + code + new_password. Updates password.

### Email in development
By default the console email backend is used — codes print in the Django terminal output. To use real SMTP, set `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend` and fill SMTP vars in `.env`.

## Auth phase scope
- Enforce @mcneese.edu emails during registration.
- Issue JWT access + refresh tokens; utilities and tests live in `backend/accounts/`.
- Email-based verification and password reset flows.
- Do **not** build cart/checkout/products yet; stay local-only.

## CI
- GitHub Actions run `black` + `pytest` (backend) and `npm run lint` + `npm run test` (frontend) on push/PR.
