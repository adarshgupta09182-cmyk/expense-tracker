# Deployment Environment Variables Setup

## Problem
The frontend and backend are deployed on different platforms (Vercel and Railway), so they need to know each other's URLs through environment variables.

## Solution

### 1. Railway Backend Configuration
Go to your Railway project dashboard and set these environment variables:

**Variable Name:** `CORS_ORIGIN`
**Value:** `https://expense-tracker-rho-brown.vercel.app`

This tells the backend to accept requests from your Vercel frontend.

### 2. Vercel Frontend Configuration
Go to your Vercel project settings → Environment Variables and add:

**Variable Name:** `VITE_API_URL`
**Value:** `https://web-production-43d51.up.railway.app`

This tells the frontend where to send API requests.

## How to Set Environment Variables

### On Railway:
1. Go to https://railway.app
2. Select your project
3. Click on the service (web-production-43d51)
4. Go to "Variables" tab
5. Add the `CORS_ORIGIN` variable
6. The service will automatically redeploy

### On Vercel:
1. Go to https://vercel.com
2. Select your project (expense-tracker-rho-brown)
3. Go to Settings → Environment Variables
4. Add `VITE_API_URL` variable
5. Redeploy the project

## Testing
After setting the environment variables:
1. Go to https://expense-tracker-rho-brown.vercel.app
2. Try to login with your old user credentials
3. The request should now reach the Railway backend successfully

## Local Development
For local development, the `.env` files are already configured:
- Backend: `PORT=3002` (runs on http://localhost:3002)
- Frontend: `VITE_API_URL=https://web-production-43d51.up.railway.app` (points to production backend)

To test locally with local backend, change `client/.env` to:
```
VITE_API_URL=http://localhost:3002
```
