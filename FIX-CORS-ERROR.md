# Fix CORS Error - Registration Failed

## 🔴 Problem

You're getting a CORS error when trying to register:
```
Access to XMLHttpRequest at 'https://web-production-43d51.up.railway.app/api/auth/register' 
from origin 'https://sensational-croissant-62fb1f.netlify.app' 
has been blocked by CORS policy
```

## ✅ Solution

The backend needs to know which frontend URL is allowed. You need to set the `CORS_ORIGIN` environment variable on Railway.

### Step 1: Go to Railway Dashboard

1. Open https://railway.app
2. Login to your account
3. Select your **Expense Tracker** project

### Step 2: Add Environment Variable

1. Click on your project
2. Go to **Variables** section
3. Click **Add Variable** or **New Variable**
4. Add this variable:

```
CORS_ORIGIN=https://sensational-croissant-62fb1f.netlify.app
```

**Important**: 
- Use your exact Netlify URL
- No trailing slash
- Must be HTTPS

### Step 3: Deploy

1. Click **Deploy** or **Redeploy**
2. Wait for deployment to complete (2-3 minutes)
3. Check the logs to confirm it deployed successfully

### Step 4: Test

1. Go back to your website: https://sensational-croissant-62fb1f.netlify.app
2. Try registering again
3. Should work now!

## 🔍 Verify It's Working

After deployment, you should see in Railway logs:
```
[INFO] Server started on port 3002 { 
  environment: 'production',
  corsOrigin: 'https://sensational-croissant-62fb1f.netlify.app'
}
```

## 🆘 Still Not Working?

1. **Clear browser cache**: Press Ctrl+Shift+Delete
2. **Hard refresh**: Press Ctrl+F5
3. **Check Railway logs**: Make sure deployment completed
4. **Verify URL**: Make sure CORS_ORIGIN matches exactly
5. **Wait**: Sometimes takes a few minutes to propagate

## 📝 Current Configuration

Your backend is already configured to accept CORS from any origin set in the `CORS_ORIGIN` environment variable.

The code in `server.js`:
```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};
app.use(cors(corsOptions));
```

This means:
- If `CORS_ORIGIN` is set → Only that origin is allowed
- If `CORS_ORIGIN` is not set → All origins are allowed (*)

## ✅ After Setting CORS_ORIGIN

Your website will be able to:
- ✅ Register new users
- ✅ Login
- ✅ Add expenses
- ✅ View budget
- ✅ Export CSV
- ✅ All features work!

---

**Quick Fix**: Set `CORS_ORIGIN=https://sensational-croissant-62fb1f.netlify.app` on Railway and redeploy.
