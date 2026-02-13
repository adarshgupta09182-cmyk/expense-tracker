# Admin Dashboard Deployment Guide

## Overview

This guide walks you through deploying the admin dashboard to production.

## Prerequisites

- Backend deployed to Railway ✅
- GitHub repository set up ✅
- Netlify account (for admin portal deployment)
- Admin secret key (for backend)

## Step 1: Set Backend Environment Variables

### On Railway Dashboard

1. Go to your Railway project
2. Navigate to Variables
3. Add/Update these variables:

```
ADMIN_SECRET=your-secure-secret-key-here
CORS_ORIGIN=https://your-admin-portal-url.netlify.app
```

**Important**: Replace `your-admin-portal-url` with your actual Netlify URL

## Step 2: Deploy Admin Portal to Netlify

### Option A: Deploy from GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add admin dashboard"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to https://app.netlify.com
   - Click "New site from Git"
   - Select GitHub and your repository
   - Configure build settings:
     - **Base directory**: `admin-registration`
     - **Build command**: (leave empty - it's static files)
     - **Publish directory**: `.` (current directory)

3. **Deploy**:
   - Click "Deploy site"
   - Wait for deployment to complete
   - Note your Netlify URL (e.g., `https://your-admin-portal.netlify.app`)

### Option B: Manual Deployment

1. **Build the admin portal** (it's already static):
   ```bash
   cd admin-registration
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `admin-registration` folder to Netlify
   - Or use Netlify CLI:
     ```bash
     npm install -g netlify-cli
     netlify deploy --prod --dir admin-registration
     ```

## Step 3: Configure Admin Portal

After deployment, configure the API URL:

### Option A: Via Browser Console

1. Open your admin portal URL
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run:
   ```javascript
   localStorage.setItem('apiUrl', 'https://web-production-43d51.up.railway.app');
   ```
5. Refresh the page

### Option B: Update HTML (Recommended)

Edit `admin-registration/dashboard.html` and add before the closing `</head>` tag:

```html
<script>
  if (!localStorage.getItem('apiUrl')) {
    localStorage.setItem('apiUrl', 'https://web-production-43d51.up.railway.app');
  }
</script>
```

Then redeploy to Netlify.

## Step 4: Create First Admin Account

1. Open your admin portal URL
2. Click "Register here"
3. Fill in the registration form:
   - **Full Name**: Your name
   - **Email**: Your email
   - **Password**: A strong password
   - **Admin Secret**: The secret you set in Railway
4. Click "Register as Admin"
5. You'll be redirected to login
6. Login with your credentials

## Step 5: Verify Deployment

### Test Admin Registration
- [ ] Navigate to admin portal
- [ ] Click "Register here"
- [ ] Try registering with wrong secret (should fail)
- [ ] Register with correct secret (should succeed)

### Test Admin Login
- [ ] Login with your credentials
- [ ] Should see dashboard

### Test Dashboard Features
- [ ] Users tab loads users
- [ ] Expenses tab loads expenses
- [ ] Statistics tab shows stats
- [ ] Search functionality works
- [ ] Can view user details
- [ ] Can delete users
- [ ] Can delete expenses
- [ ] Logout works

## Troubleshooting

### "Cannot connect to server"

**Problem**: Admin portal can't reach backend

**Solution**:
1. Check backend is running on Railway
2. Verify API URL is correct:
   ```javascript
   console.log(localStorage.getItem('apiUrl'));
   ```
3. Check CORS settings on backend
4. Verify `CORS_ORIGIN` matches your admin portal URL

### "Invalid admin secret"

**Problem**: Registration fails with invalid secret

**Solution**:
1. Verify `ADMIN_SECRET` is set on Railway
2. Check the secret value is correct
3. Ensure no extra spaces in the secret
4. Redeploy backend if changed

### "Unauthorized" error

**Problem**: Getting 401 errors

**Solution**:
1. Token may have expired - login again
2. Clear localStorage:
   ```javascript
   localStorage.clear();
   ```
3. Refresh and login again

### Users/Expenses not loading

**Problem**: Dashboard shows "Loading..." but nothing appears

**Solution**:
1. Check browser console for errors (F12)
2. Verify admin token is valid
3. Check backend is accessible
4. Verify CORS is configured correctly

### CORS errors

**Problem**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**:
1. Update `CORS_ORIGIN` on Railway to match admin portal URL
2. Ensure no trailing slash in CORS_ORIGIN
3. Redeploy backend after changing CORS_ORIGIN

## Production Checklist

- [ ] Backend deployed to Railway
- [ ] ADMIN_SECRET set on Railway
- [ ] CORS_ORIGIN set to admin portal URL
- [ ] Admin portal deployed to Netlify
- [ ] API URL configured in admin portal
- [ ] First admin account created
- [ ] All features tested
- [ ] Users can be managed
- [ ] Expenses can be managed
- [ ] Statistics display correctly
- [ ] Search functionality works
- [ ] Mobile responsiveness verified
- [ ] Logout works correctly

## Deployment URLs

After successful deployment:

- **Main App**: https://sensational-croissant-62fb1f.netlify.app
- **Backend API**: https://web-production-43d51.up.railway.app
- **Admin Portal**: https://your-admin-portal.netlify.app

## Environment Variables Summary

### Railway Backend

```
ADMIN_SECRET=your-secure-secret-key
CORS_ORIGIN=https://your-admin-portal.netlify.app
```

### Admin Portal (localStorage)

```javascript
localStorage.setItem('apiUrl', 'https://web-production-43d51.up.railway.app');
```

## Security Best Practices

1. **Admin Secret**: Keep it secure, don't share publicly
2. **CORS**: Only allow your admin portal URL
3. **HTTPS**: Always use HTTPS in production
4. **Passwords**: Use strong passwords for admin accounts
5. **Tokens**: Tokens are stored in localStorage, clear on logout
6. **Backups**: Regularly backup your users.json and expenses.json

## Monitoring

After deployment, monitor:

1. **Backend logs** on Railway for errors
2. **Admin portal** for functionality issues
3. **User management** operations
4. **Expense management** operations
5. **Statistics** accuracy

## Rollback

If something goes wrong:

1. **Admin Portal**: Redeploy previous version from Netlify
2. **Backend**: Redeploy previous version from Railway
3. **Data**: Check users.json and expenses.json backups

## Support

For issues:
1. Check browser console (F12)
2. Check Railway logs
3. Review troubleshooting section above
4. Check API documentation

## Next Steps

1. ✅ Deploy admin portal
2. ✅ Create first admin account
3. ✅ Test all features
4. ✅ Monitor for issues
5. ✅ Invite other admins to register

---

**Deployment Status**: Ready for Production

All components are ready to be deployed. Follow this guide step-by-step for a smooth deployment.
