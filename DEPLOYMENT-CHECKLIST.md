# ✅ Deployment Checklist - Cloud Deployment

Follow this checklist to deploy your Expense Tracker to the cloud.

## Phase 1: Preparation

- [ ] Read DEPLOYMENT-GUIDE.md
- [ ] Have GitHub account ready
- [ ] Have Railway account ready
- [ ] Have Vercel account ready
- [ ] Code is working locally
- [ ] All tests pass locally

## Phase 2: GitHub Setup

- [ ] Create GitHub repository
- [ ] Repository is public
- [ ] Repository name: `expense-tracker`
- [ ] Run `git init`
- [ ] Run `git add .`
- [ ] Run `git commit -m "Initial commit"`
- [ ] Run `git branch -M main`
- [ ] Run `git remote add origin https://github.com/YOUR-USERNAME/expense-tracker.git`
- [ ] Run `git push -u origin main`
- [ ] Code is visible on GitHub

## Phase 3: Backend Deployment (Railway)

- [ ] Create Railway account
- [ ] Create new project
- [ ] Select GitHub repository
- [ ] Railway auto-detects Node.js
- [ ] Deployment starts
- [ ] Deployment completes successfully
- [ ] Backend URL obtained (e.g., https://expense-tracker-production.up.railway.app)
- [ ] Environment variables set:
  - [ ] PORT=3002
  - [ ] NODE_ENV=production
  - [ ] JWT_SECRET=strong-random-string
  - [ ] JWT_EXPIRE=7d
  - [ ] CORS_ORIGIN=* (temporary)
- [ ] Backend is running (check logs)
- [ ] Backend URL saved for later

## Phase 4: Frontend Deployment (Vercel)

- [ ] Create Vercel account
- [ ] Create new project
- [ ] Select GitHub repository
- [ ] Vercel auto-detects React
- [ ] Before deploying, add environment variables:
  - [ ] VITE_API_URL=https://your-backend-url.railway.app
- [ ] Deployment starts
- [ ] Deployment completes successfully
- [ ] Frontend URL obtained (e.g., https://expense-tracker.vercel.app)
- [ ] Frontend URL saved

## Phase 5: Code Updates

- [ ] Update `client/src/utils/axios.js` to use VITE_API_URL
- [ ] Run `git add .`
- [ ] Run `git commit -m "Add production API URL"`
- [ ] Run `git push`
- [ ] Vercel auto-redeploys
- [ ] Vercel deployment completes

## Phase 6: Backend Configuration Update

- [ ] Go to Railway dashboard
- [ ] Select your project
- [ ] Go to Variables
- [ ] Update CORS_ORIGIN to: https://your-frontend-url.vercel.app
- [ ] Save changes
- [ ] Railway auto-redeploys
- [ ] Railway deployment completes

## Phase 7: Testing

- [ ] Open frontend URL in browser
- [ ] See login page
- [ ] Click "Register"
- [ ] Create test account
- [ ] Successfully registered
- [ ] Login with credentials
- [ ] See dashboard
- [ ] Add an expense
- [ ] Expense appears in table
- [ ] Edit expense
- [ ] Expense updated
- [ ] Delete expense
- [ ] Expense removed
- [ ] Set budget
- [ ] Budget displays correctly
- [ ] Filter expenses
- [ ] Filters work
- [ ] Export expenses
- [ ] CSV file downloads
- [ ] View charts
- [ ] Charts display correctly
- [ ] Logout
- [ ] Redirected to login
- [ ] Cannot access dashboard without login

## Phase 8: Verification

- [ ] Backend logs show no errors
- [ ] Frontend logs show no errors
- [ ] No CORS errors
- [ ] No 404 errors
- [ ] No 500 errors
- [ ] All API endpoints working
- [ ] Data persists (for this session)
- [ ] Performance is acceptable

## Phase 9: Sharing

- [ ] Frontend URL works from different device
- [ ] Frontend URL works from different network
- [ ] Can share URL with others
- [ ] Others can register accounts
- [ ] Others can use the app
- [ ] No issues reported

## Phase 10: Maintenance

- [ ] Set up monitoring (optional)
- [ ] Check logs regularly
- [ ] Plan for data persistence (upgrade or use MongoDB)
- [ ] Plan for backups
- [ ] Document deployment process

## Troubleshooting Checklist

If something doesn't work:

### Frontend Can't Connect to Backend
- [ ] Check VITE_API_URL in Vercel environment variables
- [ ] Check CORS_ORIGIN in Railway environment variables
- [ ] Verify URLs have no typos
- [ ] Verify URLs have no trailing slashes
- [ ] Wait 5 minutes for changes to propagate
- [ ] Check browser console for errors
- [ ] Check Vercel logs
- [ ] Check Railway logs

### Login Fails
- [ ] Check Railway logs for errors
- [ ] Verify JWT_SECRET is set
- [ ] Try registering a new account
- [ ] Check if users.json exists on Railway
- [ ] Check if data is persisting

### CORS Errors
- [ ] Update CORS_ORIGIN in Railway
- [ ] Make sure it matches frontend URL exactly
- [ ] No trailing slashes
- [ ] Wait for Railway to redeploy
- [ ] Clear browser cache
- [ ] Try incognito mode

### Data Not Persisting
- [ ] This is expected on free tier
- [ ] Data is stored in memory
- [ ] Export data regularly
- [ ] Consider upgrading to paid tier
- [ ] Consider using MongoDB

### Deployment Fails
- [ ] Check Railway logs
- [ ] Check Vercel logs
- [ ] Verify code is valid
- [ ] Verify all dependencies are installed
- [ ] Verify environment variables are set
- [ ] Try redeploying manually

## Quick Reference

| Step | Service | URL |
|------|---------|-----|
| Code | GitHub | https://github.com/YOUR-USERNAME/expense-tracker |
| Backend | Railway | https://expense-tracker-production.up.railway.app |
| Frontend | Vercel | https://expense-tracker.vercel.app |

## Important URLs

- **GitHub Repository**: https://github.com/YOUR-USERNAME/expense-tracker
- **Railway Dashboard**: https://railway.app
- **Vercel Dashboard**: https://vercel.com
- **Deployed Frontend**: https://expense-tracker.vercel.app
- **Deployed Backend**: https://expense-tracker-production.up.railway.app

## Environment Variables

### Railway (Backend)
```
PORT=3002
NODE_ENV=production
JWT_SECRET=your-strong-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=https://expense-tracker.vercel.app
```

### Vercel (Frontend)
```
VITE_API_URL=https://expense-tracker-production.up.railway.app
```

## Next Steps After Deployment

1. ✅ Share the frontend URL with others
2. ✅ Monitor logs for errors
3. ✅ Plan for data persistence
4. ✅ Set up backups
5. ✅ Consider upgrading to paid tier
6. ✅ Add custom domain (optional)

## Support

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Docs**: https://docs.github.com

---

**Status**: Ready to deploy ✅
**Last Updated**: February 13, 2026

Start with Phase 1 and work through each phase!
