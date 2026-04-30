# Deploy Bookstore to Render (Free!)

Render.app is a simple platform that deploys your full-stack app for free.

## What You Get

Free tier includes:
- Web services with auto-deploy from GitHub
- Free PostgreSQL database
- Automatic HTTPS
- Custom domains
- Environment variables management
- $7/month free credits (more than enough)

## Deploy in 3 Steps (< 5 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready to deploy to Render"
git push origin main
```

### Step 2: Create Account on Render
1. Go to https://render.com
2. Sign up with your GitHub account
3. Click "New +" → "Blueprint"
4. Select your bookstore repository
5. Give it a name (e.g., "bookstore")
6. Click "Create"

Render will automatically:
- Read `render.yaml`
- Create backend service
- Create frontend service
- Create PostgreSQL database
- Deploy everything

### Step 3: Add Environment Variables

Once deployed, go to backend service settings and add:

```
DJANGO_SECRET_KEY=your-secret-key-from-.env
# Email (recommended: Brevo HTTP API, avoids SMTP blocks)
BREVO_API_KEY=your-brevo-api-key
BREVO_FROM_EMAIL=no-reply@example.com
BREVO_FROM_NAME=Cowboy Bookstore

# If you prefer SMTP instead (often blocked on free hosts), use:
# EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USE_TLS=true
# EMAIL_HOST_USER=your-email@gmail.com
# EMAIL_HOST_PASSWORD=your-gmail-app-password

# To disable real email and just print codes to logs:
# EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

JWT_SIGNING_KEY=your-jwt-key-from-.env
STRIPE_SECRET_KEY=sk_test_xxx (or sk_live_xxx)
```

**How to get Gmail app password:**
1. Go to https://myaccount.google.com/apppasswords
2. Select Mail and Custom (Linux)
3. Generate and copy the 16-char password
4. Paste in EMAIL_HOST_PASSWORD

## That's It!

Your app is now live at:
- Frontend: `https://bookstore-frontend.onrender.com`
- Backend: `https://bookstore-backend.onrender.com`

## Auto-Deploy

Every time you `git push` to main:
1. Render automatically builds
2. Runs migrations
3. Deploys
4. Your app updates

## Free Tier Limits

- Services go to sleep after 15 min of inactivity (wake up instantly)
- 512MB RAM per service
- PostgreSQL database (free tier)

Perfect for hobby projects!

## Need Help?

1. Check Render dashboard → Logs
2. SSH into service: click "Shell" in dashboard
3. View database: in dashboard → PostgreSQL instance

## Scaling Up

When you outgrow free:
- Upgrade to paid plan ($7+/month)
- Add more memory
- Run 24/7 without sleeping

For now, free tier is perfect! 
