# 🚀 Cloud Deployment Guide - Expense Tracker

Deploy your Expense Tracker to the cloud so anyone can access it from anywhere.

## Overview

We'll deploy:
- **Backend**: Railway or Render (Node.js/Express)
- **Frontend**: Vercel or Netlify (React)

Both are free tier friendly and easy to set up.

---

## Step 1: Prepare Your Code for Deployment

### 1.1 Update CORS in `.env`

We need to allow requests from your deployed frontend domain.

First, let's prepare the `.env` for production. Update it:

```
PORT=3002
NODE_ENV=production
JWT_SECRET=change-this-to-a-strong-random-string-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=*
```

**Note**: We'll set `CORS_ORIGIN=*` for now. After deployment, update it to your frontend URL.

### 1.2 Create `.env.production` for Backend

Create a new file `server.js` already handles environment variables correctly. No changes needed.

### 1.3 Prepare Frontend for Production

The frontend is already configured. Just ensure `client/vite.config.js` uses relative paths:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3002',
    changeOrigin: true
  }
}
```

This is fine - in production, the frontend will be served from the same domain as the backend.

---

## Step 2: Push Code to GitHub

### 2.1 Create GitHub Account
Go to [github.com](https://github.com) and create a free account if you don't have one.

### 2.2 Create a New Repository
1. Click "New" on GitHub
2. Name it: `expense-tracker`
3. Make it **Public**
4. Click "Create repository"

### 2.3 Push Your Code

In your project directory:

```bash
git init
git add .
git commit -m "Initial commit - Expense Tracker"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/expense-tracker.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

---

## Step 3: Deploy Backend to Railway

Railway is the easiest option for Node.js apps.

### 3.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click "Start Project"
3. Sign up with GitHub (easiest)

### 3.2 Deploy Backend

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `expense-tracker` repository
4. Railway will auto-detect it's a Node.js app
5. Click "Deploy"

### 3.3 Configure Environment Variables

1. Go to your project on Railway
2. Click "Variables"
3. Add these variables:

```
PORT=3002
NODE_ENV=production
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

(We'll update CORS_ORIGIN after deploying frontend)

### 3.4 Get Your Backend URL

1. Go to "Deployments"
2. Click on your deployment
3. You'll see a URL like: `https://expense-tracker-production.up.railway.app`
4. **Save this URL** - you'll need it for the frontend

---

## Step 4: Deploy Frontend to Vercel

Vercel is perfect for React apps.

### 4.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub (easiest)

### 4.2 Deploy Frontend

1. Click "New Project"
2. Select your `expense-tracker` repository
3. Vercel will auto-detect it's a React app
4. Click "Deploy"

### 4.3 Configure Environment Variables

Before deploying, add environment variables:

1. In Vercel project settings, go to "Environment Variables"
2. Add this variable:

```
VITE_API_URL=https://your-backend-url.railway.app
```

(Use the Railway URL from Step 3.4)

### 4.4 Update Frontend Code

Update `client/src/utils/axios.js` to use the environment variable:

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ... rest of the code
```

### 4.5 Push Changes and Redeploy

```bash
git add .
git commit -m "Add production API URL"
git push
```

Vercel will automatically redeploy.

### 4.6 Get Your Frontend URL

After deployment, Vercel will give you a URL like:
```
https://expense-tracker.vercel.app
```

---

## Step 5: Update Backend CORS

Now that you have both URLs, update the backend:

### 5.1 Update Railway Environment Variables

1. Go to Railway dashboard
2. Select your project
3. Go to "Variables"
4. Update `CORS_ORIGIN`:

```
CORS_ORIGIN=https://expense-tracker.vercel.app
```

5. Railway will auto-redeploy

---

## Step 6: Test Your Deployment

1. Open your frontend URL: `https://expense-tracker.vercel.app`
2. Try to register a new account
3. Try to login
4. Add an expense
5. Set a budget
6. Export data

Everything should work!

---

## Troubleshooting

### Frontend Can't Connect to Backend

**Error**: "Failed to load expenses" or CORS errors

**Solution**:
1. Check that `VITE_API_URL` is set correctly in Vercel
2. Check that `CORS_ORIGIN` is set correctly in Railway
3. Verify both URLs are correct (no typos)
4. Wait 5 minutes for changes to propagate

### Data Not Persisting

**Issue**: Data disappears after refresh

**Solution**: This is normal with Railway's free tier. Data is stored in memory. To persist data:
- Upgrade to Railway's paid tier
- Or use MongoDB (see MONGODB-SETUP.md)

### Login Always Fails

**Issue**: Can't login even with correct credentials

**Solution**:
1. Check backend logs on Railway
2. Verify JWT_SECRET is set
3. Try registering a new account first

### CORS Errors

**Error**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**:
1. Update `CORS_ORIGIN` in Railway to match your frontend URL
2. Make sure there are no trailing slashes
3. Wait for Railway to redeploy

---

## Advanced: Use MongoDB for Data Persistence

If you want data to persist, use MongoDB:

### Option A: MongoDB Atlas (Free)

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster
4. Get connection string
5. Update `server-mongodb.js` to use MongoDB
6. Deploy `server-mongodb.js` instead of `server.js`

### Option B: Railway PostgreSQL

Railway offers free PostgreSQL. You could adapt the code to use PostgreSQL instead of JSON files.

---

## Monitoring & Maintenance

### View Logs

**Railway**:
1. Go to project
2. Click "Deployments"
3. Click on deployment
4. View logs

**Vercel**:
1. Go to project
2. Click "Deployments"
3. Click on deployment
4. View logs

### Update Code

To update your app:

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push
```

Both Railway and Vercel will automatically redeploy.

### Backup Data

Since data is stored in memory on free tier:
- Export your data regularly using the Export feature
- Or upgrade to paid tier for persistent storage

---

## Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| Railway | 5GB/month | $5/month after |
| Vercel | Unlimited | Free for hobby |
| GitHub | Unlimited | Free |
| **Total** | **Free** | **~$5/month** |

---

## Production Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set correctly
- [ ] CORS configured
- [ ] Frontend can connect to backend
- [ ] Can register new account
- [ ] Can login
- [ ] Can add expenses
- [ ] Can set budget
- [ ] Can export data
- [ ] Shared URL with others

---

## Share Your App

Once deployed, share the Vercel URL with others:

```
https://expense-tracker.vercel.app
```

They can:
- Register their own account
- Track their expenses
- Set budgets
- Export data

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy backend to Railway
3. ✅ Deploy frontend to Vercel
4. ✅ Configure environment variables
5. ✅ Test the deployment
6. ✅ Share with others

---

## Support

If you get stuck:
1. Check the troubleshooting section above
2. Check Railway logs
3. Check Vercel logs
4. Review the error messages carefully

---

## Alternative Deployment Options

### Backend Alternatives
- **Heroku** (paid, but easy)
- **Render** (free tier available)
- **Fly.io** (free tier available)

### Frontend Alternatives
- **Netlify** (free tier available)
- **GitHub Pages** (free, but limited)

---

**Ready to deploy?** Start with Step 1! 🚀
