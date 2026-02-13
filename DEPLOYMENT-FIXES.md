# Deployment Fixes - Role Removal & CORS Configuration

## Summary of Changes

All role selection has been removed from the registration and login flows. Users are now automatically assigned the "user" role upon registration.

## Files Modified

### 1. Backend Changes

#### server.js
- **Login endpoint** (`/api/auth/login`): Removed `body('role').optional().isIn(['user', 'admin'])` validation
- **Login endpoint**: Removed `role` parameter from request destructuring
- **Login endpoint**: Removed role comparison check (`if (role && user.role !== role)`)
- **Registration endpoint**: Already had `role: 'user'` hardcoded (no changes needed)

### 2. Frontend Changes

#### client/src/pages/Register.jsx
- Removed `role: 'user'` from initial form state
- Removed role selection dropdown UI
- Updated `handleSubmit` to call `register(formData.name, formData.email, formData.password)` without role parameter

#### client/src/pages/Login.jsx
- Removed `role: 'user'` from initial form state
- Removed role selection dropdown UI
- Updated `handleSubmit` to call `login(formData.email, formData.password)` without role parameter

#### client/src/context/AuthContext.jsx
- Updated `register` function signature: `async (name, email, password)` (removed role parameter)
- Updated `register` API call: `axios.post('/auth/register', { name, email, password })` (removed role)
- Updated `login` function signature: `async (email, password)` (removed role parameter)
- Updated `login` API call: `axios.post('/auth/login', { email, password })` (removed role)

### 3. Environment Configuration

#### .env
- Updated `CORS_ORIGIN` from `http://localhost:5173` to `https://sensational-croissant-62fb1f.netlify.app`
- This fixes CORS errors between Netlify frontend and Railway backend

## Deployment Instructions

### Step 1: Push Changes to GitHub

```powershell
# From C:\Kiro directory
git add .
git commit -m "Remove role selection from registration and login, update CORS origin"
git push origin main
```

### Step 2: Railway Auto-Deployment

- Railway will automatically detect the push and redeploy the backend
- Monitor deployment at: https://railway.app
- Backend URL: https://web-production-43d51.up.railway.app

### Step 3: Netlify Auto-Deployment

- Netlify will automatically detect the push and redeploy the frontend
- Monitor deployment at: https://app.netlify.com
- Frontend URL: https://sensational-croissant-62fb1f.netlify.app

### Step 4: Testing

1. Visit the frontend: https://sensational-croissant-62fb1f.netlify.app
2. Register a new account (no role selection dropdown)
3. Login with the registered credentials (no role selection dropdown)
4. Verify dashboard loads and expenses can be added

## What Changed for Users

- **Registration**: No longer asks for user/admin role selection - all new users are registered as "user" role
- **Login**: No longer asks for role selection - login works with just email and password
- **CORS**: Fixed cross-origin requests between Netlify and Railway

## Verification Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Netlify
- [ ] Registration form no longer shows role dropdown
- [ ] Login form no longer shows role dropdown
- [ ] Can register new account successfully
- [ ] Can login with registered credentials
- [ ] Dashboard loads after login
- [ ] No CORS errors in browser console
