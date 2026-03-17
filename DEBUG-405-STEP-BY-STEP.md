# 🔧 Debug 405 Error - Step by Step

## Step 1: Check Browser Console

1. Go to https://expense-tracker-rho-brown.vercel.app
2. Open DevTools (F12)
3. Go to **Console** tab
4. Look for these logs:

```
API_URL configured as: https://expense-tracker-rho-brown.vercel.app/api
VITE_API_URL env var: https://expense-tracker-rho-brown.vercel.app
Environment: production
```

**If you see this, the frontend is configured correctly.**

---

## Step 2: Check Network Tab

1. Still in DevTools
2. Go to **Network** tab
3. Try to register
4. Look for the failed request (red)
5. Click on it
6. Check the **Headers** tab

### What to Look For

**Request URL:**
```
https://expense-tracker-rho-brown.vercel.app/api/auth/register
```

**Request Method:**
```
POST
```

**Status:**
```
405 Method Not Allowed
```

---

## Step 3: Check Vercel Logs

1. Go to https://vercel.com/dashboard
2. Click **expense-tracker**
3. Click **Deployments**
4. Click latest deployment
5. Click **Logs**

### Look For

**Good:**
```
✓ Initializing PostgreSQL database...
✓ Database initialization complete
```

**Bad:**
```
✗ Database initialization failed
✗ Error: getaddrinfo ENOTFOUND
```

---

## Step 4: Check Response Headers

In Network tab, click the failed request:

1. Go to **Response Headers**
2. Look for `Allow` header
3. It should show allowed methods

Example:
```
Allow: GET, POST, PUT, DELETE
```

---

## Step 5: Report Back

Tell me:

1. **What does the console show?**
   - Copy the API_URL log

2. **What's the request URL?**
   - Copy from Network tab

3. **What's the request method?**
   - Should be POST

4. **What do Vercel logs show?**
   - Database initialized?
   - Any errors?

5. **What's in Response Headers?**
   - Is there an Allow header?

---

## Common Issues & Fixes

### Issue: API_URL is wrong
```
API_URL configured as: https://expense-tracker-rho-brown.vercel.app
```
**Fix**: VITE_API_URL should be set in Vercel env vars

### Issue: Database not initialized
```
✗ Database initialization failed
```
**Fix**: Check DATABASE_URL in Vercel env vars

### Issue: Request going to wrong URL
```
https://expense-tracker-rho-brown.vercel.app/auth/register
```
**Fix**: Should be `/api/auth/register`

---

## Next Steps

1. Check browser console
2. Check Network tab
3. Check Vercel logs
4. Report what you find
5. I'll provide specific fix

---

**Start debugging now!** 👈

1. Open: https://expense-tracker-rho-brown.vercel.app
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for API_URL logs
