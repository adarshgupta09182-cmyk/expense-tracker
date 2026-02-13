# Final Setup Guide - Fix 404 Errors

## Problem
Login and Register are showing "Route not found" errors.

## Root Cause
The Railway backend needs to have the CORS_ORIGIN environment variable set to accept requests from the Vercel frontend.

## Solution

### Step 1: Set CORS_ORIGIN on Railway

1. Go to https://railway.app
2. Select your project
3. Click on the service (web-production-43d51)
4. Click **Variables** tab
5. Look for `CORS_ORIGIN` variable
6. If it exists, update it to: `https://expense-tracker-rho-brown.vercel.app`
7. If it doesn't exist, click **Add Variable** and create it:
   - **Name:** `CORS_ORIGIN`
   - **Value:** `https://expense-tracker-rho-brown.vercel.app`
8. Click **Save** or **Deploy**
9. Wait for the service to redeploy (watch the logs)

### Step 2: Verify Vercel is Redeployed

1. Go to https://vercel.com/dashboard
2. Click on project: **expense-tracker-rho-brown**
3. Check **Deployments** tab
4. Make sure the latest deployment is showing "Ready" status
5. If not, click the **...** menu and click **Redeploy**

### Step 3: Test

1. Go to https://expense-tracker-rho-brown.vercel.app/login
2. Try to login with any email
3. You should now see the proper error message from the backend (not "Route not found")

## URLs Reference
- **Frontend:** https://expense-tracker-rho-brown.vercel.app
- **Backend:** https://web-production-43d51.up.railway.app
- **Backend Health Check:** https://web-production-43d51.up.railway.app/health

## If Still Not Working

1. Check Railway logs to see if the backend is running
2. Check browser console (F12) for any CORS errors
3. Verify the CORS_ORIGIN is set correctly on Railway (no trailing slash)
4. Make sure Vercel deployment is complete and showing "Ready"
