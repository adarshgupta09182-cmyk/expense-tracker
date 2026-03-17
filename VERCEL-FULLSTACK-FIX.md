# ✅ Vercel Full-Stack Configuration Fix

## Problem Identified
The 405 error occurs because Vercel wasn't properly configured for a full-stack application with both frontend and backend.

## Solution Applied

### 1. Updated vercel.json
Changed from a single-build approach to a proper full-stack configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}
```

### 2. Updated client/package.json
Added `vercel-build` script for Vercel deployment.

---

## What This Fixes

✅ Proper separation of frontend and backend builds
✅ Correct routing for API endpoints
✅ Static file serving for React app
✅ POST requests to `/api/auth/register` will work

---

## Next Steps

### 1. Push Changes

```bash
git add vercel.json client/package.json
git commit -m "Fix Vercel full-stack configuration"
git push origin main
```

### 2. Wait for Vercel

Vercel will auto-deploy (3-5 minutes for full rebuild)

### 3. Test

Go to: https://expense-tracker-rho-brown.vercel.app

Try to:
- Register
- Login
- Add expense

---

## What Changed

**vercel.json**:
- Added proper `builds` configuration
- Separated frontend and backend builds
- Fixed routing patterns

**client/package.json**:
- Added `vercel-build` script

---

## Expected Result

After deployment:
- ✅ Frontend loads correctly
- ✅ API endpoints respond
- ✅ POST requests work
- ✅ 405 errors gone

---

**Push changes now!**

```bash
git add vercel.json client/package.json
git commit -m "Fix Vercel full-stack configuration"
git push origin main
```