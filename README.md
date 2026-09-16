# Cowboy Online Bookstore

A team-built McNeese bookstore project with a React storefront and a Django REST API. Browse 36 products, search by course or category, save a wishlist, and submit an order request for pickup or delivery. The server owns prices, discounts, tax, and stock checks; browser-submitted totals are never trusted.

- [Live storefront](https://cowboy-online-bookstore.vercel.app/)
- [API health](https://cowboy-bookstore-api.vercel.app/api/health/)
- [Product API](https://cowboy-bookstore-api.vercel.app/api/products/)

## Stack

React 18, TypeScript, Vite, Tailwind CSS, Django 4.2, Django REST Framework, JWT, PostgreSQL (Neon in production), Vercel, Vitest, and pytest. Local development uses SQLite unless `DATABASE_URL` is set.

## Run locally

Use Python 3.12 and Node.js 18 or newer. In one terminal:

```bash
cd backend
python -m venv .venv
# Activate .venv using your shell's command.
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_products
python manage.py runserver
```

In another terminal:

```bash
cd frontend
npm ci
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies `/api` to the Django server at `http://localhost:8000`. The catalog seed can safely be rerun; it updates products by slug without duplicating them.

## Tests

```bash
cd backend
pytest
python manage.py check
python manage.py makemigrations --check --dry-run
```

```bash
cd frontend
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Production setup

The `backend/` and `frontend/` folders are separate Vercel projects. The backend uses Vercel's Django preset and Python 3.12; the frontend uses Vite. Connect a PostgreSQL database to the backend and set `DATABASE_URL`, `DJANGO_SECRET_KEY`, `JWT_SIGNING_KEY`, `DJANGO_DEBUG=False`, and `CORS_ALLOWED_ORIGINS=https://cowboy-online-bookstore.vercel.app`. Set the frontend's `VITE_API_BASE_URL=https://cowboy-bookstore-api.vercel.app`. Then run Django migrations and `seed_products` against the connected database before deployment.

The Vercel projects are currently deployed through the CLI. The team organization's GitHub repository is not connected to Vercel's Git integration, so pushing to GitHub alone does not publish a new version. Deploy each changed project from its directory with `vercel deploy --prod` until repository access is granted to the Vercel GitHub app.

## Accounts and orders

Registration accepts `@mcneese.edu` addresses and normally requires an emailed verification code. Configure a real email backend (`EMAIL_BACKEND`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`) before enabling public registration or password recovery. With the console email backend, those endpoints return 503 rather than claiming to send a code that nobody can receive. Existing activated users can still sign in.

Checkout records a **pending request**, not a paid purchase. It does not collect card numbers or charge Cowboy Cash. Pickup preferences, delivery details, and stock must still be confirmed separately. Do not describe the order as paid, shipped, or ready before a fulfillment process and payment provider are connected.

API routes are under `/api/auth/` and `/api/products/`. The `/api/health/` endpoint checks database connectivity. Keep `.env` files, Vercel local credentials, and database URLs out of Git.
