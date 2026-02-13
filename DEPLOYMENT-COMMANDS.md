# 📋 Deployment Commands - Quick Reference

Copy and paste these commands to deploy your app.

## Step 1: Push to GitHub

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Expense Tracker"

# Rename branch to main
git branch -M main

# Add remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/expense-tracker.git

# Push to GitHub
git push -u origin main
```

## Step 2: Update Code for Production

```bash
# Make sure you're in the project root
cd /path/to/expense-tracker

# The code is already updated, just verify:
# - client/src/utils/axios.js uses VITE_API_URL
# - .env has correct settings

# If you made changes, push them:
git add .
git commit -m "Production ready"
git push
```

## Step 3: Railway Setup (Backend)

### Create Railway Account
1. Go to https://railway.app
2. Click "Start Project"
3. Sign up with GitHub

### Deploy to Railway
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select `expense-tracker`
4. Railway auto-deploys

### Set Environment Variables in Railway

In Railway dashboard, go to Variables and add:

```
PORT=3002
NODE_ENV=production
JWT_SECRET=your-super-secret-key-change-this-to-something-random
JWT_EXPIRE=7d
CORS_ORIGIN=*
```

### Get Backend URL
- Go to Deployments
- Copy the URL (looks like: https://expense-tracker-production.up.railway.app)
- Save it for next step

## Step 4: Vercel Setup (Frontend)

### Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub

### Deploy to Vercel
1. Click "New Project"
2. Select `expense-tracker` repository
3. Vercel auto-detects React
4. Before deploying, add environment variables:

```
VITE_API_URL=https://your-railway-url.railway.app
```

(Replace with your actual Railway URL from Step 3)

5. Click "Deploy"

### Get Frontend URL
- After deployment, copy the URL (looks like: https://expense-tracker.vercel.app)
- Save it

## Step 5: Update Backend CORS

Go back to Railway and update CORS_ORIGIN:

```
CORS_ORIGIN=https://your-vercel-url.vercel.app
```

(Replace with your actual Vercel URL from Step 4)

Railway will auto-redeploy.

## Step 6: Test

Open your Vercel URL in browser and test:
- Register account
- Login
- Add expense
- Set budget
- Export data

## Update Your App

After deployment, to update your app:

```bash
# Make changes locally
# Then:

git add .
git commit -m "Your changes"
git push
```

Both Railway and Vercel will auto-redeploy!

## Useful Commands

### Check Git Status
```bash
git status
```

### View Git Log
```bash
git log --oneline
```

### View Remote
```bash
git remote -v
```

### Pull Latest Changes
```bash
git pull
```

### Create New Branch
```bash
git checkout -b feature-name
```

### Switch Branch
```bash
git checkout main
```

## Environment Variables Reference

### Railway (Backend)
```
PORT=3002
NODE_ENV=production
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

### Vercel (Frontend)
```
VITE_API_URL=https://your-backend-url.railway.app
```

## URLs to Remember

- **GitHub**: https://github.com/YOUR-USERNAME/expense-tracker
- **Railway**: https://railway.app
- **Vercel**: https://vercel.com
- **Your Backend**: https://your-app.railway.app
- **Your Frontend**: https://your-app.vercel.app

## Troubleshooting Commands

### Check if Git is Installed
```bash
git --version
```

### Check Node.js Version
```bash
node --version
```

### Check npm Version
```bash
npm --version
```

### Clear npm Cache
```bash
npm cache clean --force
```

### Reinstall Dependencies
```bash
npm install
npm install --prefix client
```

## Quick Deployment Checklist

- [ ] `git init`
- [ ] `git add .`
- [ ] `git commit -m "Initial commit"`
- [ ] `git branch -M main`
- [ ] `git remote add origin https://github.com/YOUR-USERNAME/expense-tracker.git`
- [ ] `git push -u origin main`
- [ ] Create Railway account
- [ ] Deploy to Railway
- [ ] Set Railway environment variables
- [ ] Get Railway URL
- [ ] Create Vercel account
- [ ] Deploy to Vercel
- [ ] Set Vercel environment variables (VITE_API_URL)
- [ ] Get Vercel URL
- [ ] Update Railway CORS_ORIGIN
- [ ] Test in browser
- [ ] Share URL with others

## Common Issues & Fixes

### "fatal: not a git repository"
```bash
git init
```

### "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/expense-tracker.git
```

### "Permission denied (publickey)"
- Add SSH key to GitHub
- Or use HTTPS instead of SSH

### "npm ERR! code ENOENT"
```bash
npm install
```

### "Port already in use"
- Change PORT in .env
- Or kill the process using the port

## After Deployment

### Share Your App
```
https://your-app.vercel.app
```

### View Logs

**Railway**:
- Go to project
- Click "Deployments"
- View logs

**Vercel**:
- Go to project
- Click "Deployments"
- View logs

### Update App
```bash
git add .
git commit -m "Your changes"
git push
```

---

**Ready to deploy?** Follow the steps above! 🚀

For detailed guide, see DEPLOYMENT-GUIDE.md
