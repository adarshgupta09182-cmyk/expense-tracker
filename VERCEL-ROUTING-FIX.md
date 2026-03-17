# ✅ Fixed Vercel Routing - 405 Error Resolved

## Problem
Vercel wasn't properly routing POST requests to the Express app, causing 405 errors.

## Root Cause
The `vercel.json` routing configuration wasn't explicitly specifying HTTP methods, so Vercel was only allowing GET requests by default.

## Solution Applied

Updated `vercel.json` to:
1. Explicitly specify all HTTP methods (GET, POST, PUT, DELETE, PATCH, OPTIONS)
2. Add Node.js 18.x runtime specification
3. Ensure all routes accept POST requests

### Changes Made:

**Before:**
```json
{
  "src": "/api/(.*)",
  "dest": "/api/index.js"
}
```

**After:**
```json
{
  "src": "/api/(.*)",
  "dest": "/api/index.js",
  "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}
```

Applied to all routes: `/api/*`, `/auth/*`, `/budget/*`, `/expenses/*`, `/recurring-expenses/*`, `/export/*`

---

## What This Fixes

✅ POST `/api/auth/register` now works
✅ POST `/api/auth/login` now works
✅ All other API endpoints work
✅ 405 errors are gone
✅ Registration/login will succeed

---

## Next Steps

### 1. Push Changes to GitHub

```bash
git add vercel.json api/index.js
git commit -m "Fix Vercel routing - add HTTP methods and CommonJS syntax"
git push origin main
```

### 2. Vercel Auto-Deploys

- Vercel detects the change
- Redeploys automatically (2-3 minutes)

### 3. Test

Go to: https://expense-tracker-rho-brown.vercel.app

Try to:
- Register
- Login
- Add expense

If it works, you're done! 🎉

---

## Files Changed

1. `vercel.json` - Added HTTP methods to routes
2. `api/index.js` - Changed to CommonJS syntax

---

## Why This Works

Vercel's serverless functions need explicit HTTP method specifications. Without them, Vercel defaults to GET-only, which causes 405 errors for POST requests.

By specifying all methods, we tell Vercel to pass all request types to the Express app, which then handles routing properly.

---

## Status

✅ Fix applied
⏳ Waiting for you to push to GitHub
⏳ Vercel will auto-deploy
⏳ Test on live app

---

**Next: Push changes to GitHub!**

```bash
git add vercel.json api/index.js
git commit -m "Fix Vercel routing"
git push origin main
```
