# Bookstore Ready for Render Deployment!

Your bookstore is now configured to deploy to Render.com for **free**!

## What Changed

* **Backend Dockerfile** - Production-ready with gunicorn
* **Frontend Dockerfile** - Multi-stage build for nginx
* **Django Settings** - Auto-detects PostgreSQL via `DATABASE_URL`
* **render.yaml** - Infrastructure-as-code for Render
* **requirements.txt** - Added `dj-database-url` for PostgreSQL support

## 3-Step Deployment (< 5 minutes)

### Step 1: Commit your changes
```bash
cd ~/bookstore
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

### Step 2: Create Render Account
- Go to https://render.com
- Sign up with GitHub
- Click "New +" → "Blueprint"
- Select your bookstore repo
- Name it and click "Create"

**That's it!** Render will:
- Read `render.yaml`
- Create backend service
- Create frontend service  
- Create PostgreSQL database
- Auto-deploy everything

### Step 3: Add Environment Variables
In Render dashboard, go to **bookstore-backend** service → **Environment**:

```
DJANGO_SECRET_KEY=<from your .env file>
EMAIL_HOST_USER=<your-email@gmail.com>
EMAIL_HOST_PASSWORD=<your Gmail app password>
JWT_SIGNING_KEY=<from your .env file>
STRIPE_SECRET_KEY=<if using Stripe>
```

**To get Gmail app password:**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Custom (Linux)"
3. Generate the 16-char password
4. Paste into EMAIL_HOST_PASSWORD

## Your URLs

After deployment:
- **Frontend**: `https://bookstore-frontend.onrender.com`
- **Backend**: `https://bookstore-backend.onrender.com`
- **Database**: Automatically provided by Render

## Key Benefits

* **Free Forever** ($7/month free credits included)
* **Auto-Deploy** - Push to main, app updates
* **PostgreSQL Included** - No extra cost
* **HTTPS Automatic** - Secure by default
* **Easy Scaling** - Upgrade anytime

## Free Tier Details

- Services sleep after 15 min inactivity (instant wake-up)
- 512MB RAM per service
- PostgreSQL database with free tier
- Enough for hobby/small projects

## How Auto-Deploy Works

1. You do `git push origin main`
2. Render detects the push
3. Automatically builds from Dockerfile
4. Runs Django migrations
5. Restarts services
6. Your app is updated!

## If You Need Help

- **Logs**: Render dashboard → Logs
- **SSH**: Render dashboard → "Shell"
- **Database**: Render dashboard → PostgreSQL instance

## Next: Update Frontend API URL

Check your frontend `api.js` or axios config points to:
```
https://bookstore-backend.onrender.com
```

(The `render.yaml` already sets `VITE_API_BASE_URL` for you)

---

**You're ready!**

1. Commit: `git push origin main`
2. Go to render.com
3. Connect GitHub
4. Done!

See `RENDER_DEPLOYMENT.md` for detailed instructions.
