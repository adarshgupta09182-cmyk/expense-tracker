# Vercel Environment Variables Setup

## Quick Reference

Add these environment variables to your Vercel project:

### Step-by-Step in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click on **expense-tracker** project
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Add each variable below:

---

## Required Variables

### 1. DATABASE_URL
**Value**: Your Supabase PostgreSQL connection string

```
postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

**Where to get it**:
- Go to https://supabase.com/dashboard
- Select your project
- Settings → Database → Connection string → URI
- Copy the full string
- Replace `[YOUR-PASSWORD]` with your database password

---

### 2. JWT_SECRET
**Value**: A strong random string (generate below)

**Generate it**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example output**:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

### 3. RESEND_API_KEY
**Value**: 
```
re_bP4aXCGt_5Y9xPnfTFRnqM1RLdLUSKXZ3
```

---

### 4. VITE_API_URL
**Value**: Your Vercel domain

```
https://expense-tracker-rho-brown.vercel.app
```

---

### 5. NODE_ENV
**Value**: 
```
production
```

---

### 6. VERCEL
**Value**: 
```
1
```

---

## After Adding Variables

1. Click **Save** for each variable
2. Go to **Deployments** tab
3. Click the three dots on latest deployment
4. Click **Redeploy**
5. Wait for deployment to complete (2-3 minutes)

---

## Verification

After redeployment:

1. Go to https://expense-tracker-rho-brown.vercel.app
2. Try to **Register** a new account
3. Try to **Login**
4. If successful, database is connected!

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection refused" | Check DATABASE_URL is correct, wait 5 min after adding |
| "Authentication failed" | Verify password in DATABASE_URL matches Supabase |
| "Tables not created" | Check Vercel logs, redeploy again |
| Still getting errors | Check that all 6 variables are added |

---

## Environment Variables Summary Table

| Variable | Example Value | Where to Get |
|----------|---------------|--------------|
| `DATABASE_URL` | `postgresql://postgres:pass@db.xxxxx.supabase.co:5432/postgres` | Supabase Dashboard |
| `JWT_SECRET` | `a1b2c3d4e5f6...` | Generate with node command |
| `RESEND_API_KEY` | `re_bP4aXCGt_5Y9xPnfTFRnqM1RLdLUSKXZ3` | Already provided |
| `VITE_API_URL` | `https://expense-tracker-rho-brown.vercel.app` | Your Vercel domain |
| `NODE_ENV` | `production` | Fixed value |
| `VERCEL` | `1` | Fixed value |
