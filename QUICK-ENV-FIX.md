# Quick Fix: 404 Error on Login

## Problem
When trying to login, you get a 404 error. This means the frontend doesn't know where to send the API request.

## Root Cause
The environment variable `VITE_API_URL` is not set on Vercel, so the frontend is trying to use the default `/api` proxy which doesn't exist on Vercel.

## Solution (2 Steps)

### Step 1: Set Frontend Environment Variable on Vercel
1. Go to https://vercel.com/dashboard
2. Click on project: **expense-tracker-rho-brown**
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Click **Add New**
6. Fill in:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://web-production-43d51.up.railway.app`
   - **Environments:** Select all (Production, Preview, Development)
7. Click **Save**
8. Go to **Deployments** tab
9. Find the latest deployment and click the **...** menu
10. Click **Redeploy**

### Step 2: Set Backend CORS on Railway
1. Go to https://railway.app
2. Select your project
3. Click on the service (web-production-43d51)
4. Click **Variables** tab
5. Find `CORS_ORIGIN` and update it to: `https://expense-tracker-rho-brown.vercel.app`
   - If it doesn't exist, click **Add Variable** and create it
6. The service will auto-redeploy (watch the logs)

## Testing
After both steps are complete:
1. Wait 2-3 minutes for deployments to complete
2. Go to https://expense-tracker-rho-brown.vercel.app
3. Try to login with your old user credentials
4. It should now work!

## URLs Reference
- **Frontend:** https://expense-tracker-rho-brown.vercel.app
- **Backend:** https://web-production-43d51.up.railway.app
- **GitHub:** https://github.com/adarshgupta09182-cmyk/expense-tracker
