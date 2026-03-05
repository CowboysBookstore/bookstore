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
└── README.md
```

---

## Getting started (from scratch)

> You need **Python 3.11+**, **Node 18+**, and **Git** installed.

### 1. Clone the repo

```bash
git clone https://github.com/CowboysBookstore/bookstore.git
cd bookstore
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` in a text editor and fill in the values. At minimum you need:

- `DJANGO_SECRET_KEY` — any random string (e.g. `python3 -c "import secrets; print(secrets.token_urlsafe(50))"`)
- `JWT_SIGNING_KEY` — another random string
- For email to actually send, fill in the `EMAIL_*` fields with a Gmail address and [App Password](https://myaccount.google.com/apppasswords)

### 3. Start the backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cd backend
python manage.py migrate
python manage.py runserver
```

The API will be running at **http://localhost:8000**.

Leave this terminal open and open a **new terminal** for the frontend.

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be running at **http://localhost:5173**. Open it in your browser.

### 5. Create an admin account (optional)

```bash
cd backend
source ../.venv/bin/activate
python manage.py createsuperuser
```

Then visit **http://localhost:8000/admin/** to manage users and codes.

---

## Running tests

```bash
# Backend (from repo root, with venv active)
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
