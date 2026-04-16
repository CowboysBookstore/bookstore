# Deployment Checklist for Render

## Before You Depl## What Render Automatically Creates

* bookstore-backend web service
  - Python 3.11 environment
  - Runs: `gunicorn --bind 0.0.0.0:8000 --workers 2 core.wsgi:application`
  - Auto-runs migrations

* bookstore-frontend static site
  - Builds: `npm run build`
  - Serves: `dist/` folder via nginx

* bookstore-db PostgreSQL database
  - Version 15
  - Free tier
  - Auto-connected to backendetup
- [ ] Backend has `Dockerfile` (production-ready)
- [ ] Frontend has `Dockerfile` (multi-stage build)
- [ ] `render.yaml` configured
- [ ] Django settings support PostgreSQL via `DATABASE_URL`
- [ ] `requirements.txt` has gunicorn, psycopg2, dj-database-url
- [ ] Backend requirements updated with production deps

### Code Ready
- [ ] All code committed locally
- [ ] No uncommitted changes: `git status`
- [ ] Ready to push to GitHub

## Deployment Steps

### Step 1: Commit & Push (2 min)
```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

### Step 2: Create Render Account (1 min)
- [ ] Go to https://render.com
- [ ] Sign up with GitHub account
- [ ] Authorize GitHub access

### Step 3: Deploy via Blueprint (1 min)
- [ ] Click "New +" button
- [ ] Select "Blueprint"
- [ ] Choose "bookstore" repository
- [ ] Click "Create" (auto-reads render.yaml)
- [ ] Wait for services to deploy (~2-3 min)

### Step 4: Add Environment Variables (1 min)
In Render dashboard  bookstore-backend  Environment:

- [ ] Add `DJANGO_SECRET_KEY` from your `.env`
- [ ] Add `EMAIL_HOST_USER` (your Gmail)
- [ ] Add `EMAIL_HOST_PASSWORD` (Gmail app password from https://myaccount.google.com/apppasswords)
- [ ] Add `JWT_SIGNING_KEY` from your `.env`
- [ ] Add `STRIPE_SECRET_KEY` (if using Stripe)

### Step 5: Verify Deployment (1 min)
- [ ] Backend service shows "Live"
- [ ] Frontend service shows "Live"
- [ ] Database initialized (check logs)
- [ ] Can access frontend URL

## What Render Automatically Creates

 **bookstore-backend** web service
- Python 3.11 environment
- Runs: `gunicorn --bind 0.0.0.0:8000 --workers 2 core.wsgi:application`
- Auto-runs migrations

 **bookstore-frontend** static site
- Builds: `npm run build`
- Serves: `dist/` folder via nginx

 **bookstore-db** PostgreSQL database
- Version 15
- Free tier
- Auto-connected to backend

## Accessing Your App

After deployment (5 min):

- **Frontend**: `https://bookstore-frontend.onrender.com`
- **Backend API**: `https://bookstore-backend.onrender.com/api/`
- **Admin Panel**: `https://bookstore-backend.onrender.com/admin/`

## Auto-Deploy on Git Push

Every time you push to `main`:
```bash
git push origin main
```

Render automatically:
1. Builds Docker images
2. Runs migrations
3. Deploys new version
4. Zero downtime ✨

## Troubleshooting

### Backend won't start
```
Render  bookstore-backend  Logs
Check for migration errors or missing env vars
```

### Frontend not connecting to backend
- Check frontend logs for API URL
- Verify backend is actually running
- Update `VITE_API_BASE_URL` env var

### Database connection error
- Check PostgreSQL service is running
- Verify `DATABASE_URL` is set in backend env
- Check logs for connection details

### Can't SSH into service
```
Render dashboard  Service  Shell
Check if service is running (not sleeping)
```

## Free Tier Limits

⚠️ After 15 min of inactivity, services "sleep"
- Next request wakes them up (takes ~5 sec)
- Perfect for hobby projects
- Upgrade to paid if you need 24/7

## Cost Breakdown

- **Free tier**: $7/month in credits included
- **Backend service**: Free (with sleep)
- **Frontend service**: Free
- **PostgreSQL database**: Free (limited)
- **Total cost**: $0 (while using free tier)

## Next Steps After Deploy

1.  **Test your app** - go to frontend URL
2.  **Test admin panel** - create superuser if needed
3.  **Set up monitoring** - Render has built-in logs
4.  **Configure custom domain** - Render allows this
5.  **Enable auto-deploy** - Already enabled! 

## FAQ

**Q: Will my app go down?**
A: Only services sleep after 15 min inactivity. First request wakes them instantly.

**Q: Can I use a custom domain?**
A: Yes! Render  Settings  Custom Domain

**Q: How do I access the database?**
A: Render  PostgreSQL instance  Details

**Q: Can I SSH into the server?**
A: Yes! Render  Service  Shell

**Q: What if I need more power?**
A: Click "Upgrade Plan" - paid plans start at $7/month

---

**Ready? Let's go! **

```bash
git add .
git commit -m "Ready for Render"
git push origin main
# Then go to render.com and create new Blueprint from repository
```
