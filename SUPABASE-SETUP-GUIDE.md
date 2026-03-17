# Supabase Setup Guide for Expense Tracker

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click **"Sign Up"** or **"Start Your Project"**
3. Sign in with GitHub, Google, or email
4. Click **"New Project"**
5. Fill in the form:
   - **Project Name**: `expense-tracker` (or any name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Select "Free" tier
6. Click **"Create new project"** and wait 2-3 minutes for setup

## Step 2: Get PostgreSQL Connection String

1. In Supabase dashboard, go to **Settings** (bottom left)
2. Click **"Database"** tab
3. Scroll down to **"Connection string"**
4. Select **"URI"** tab
5. Copy the connection string (looks like: `postgresql://[user]:[password]@[host]:[port]/[database]`)
6. **Important**: Replace `[YOUR-PASSWORD]` with the database password you created in Step 1

Example format:
```
postgresql://postgres:YourPasswordHere@db.xxxxx.supabase.co:5432/postgres
```

## Step 3: Update Local .env File

Add the connection string to your `.env` file:

```env
DATABASE_URL=postgresql://postgres:YourPasswordHere@db.xxxxx.supabase.co:5432/postgres
```

## Step 4: Test Local Connection

1. Stop your local server (if running)
2. Run: `npm start`
3. Check console for: `✓ Database initialization complete`
4. Try logging in or registering - tables should auto-create

## Step 5: Add to Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your **expense-tracker** project
3. Click **Settings** → **Environment Variables**
4. Add these variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase connection string |
| `JWT_SECRET` | Generate a strong random key (see below) |
| `RESEND_API_KEY` | `re_bP4aXCGt_5Y9xPnfTFRnqM1RLdLUSKXZ3` |
| `VITE_API_URL` | `https://your-vercel-domain.vercel.app` |

### Generate JWT_SECRET

Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `JWT_SECRET` in Vercel.

## Step 6: Redeploy on Vercel

1. Go to Vercel dashboard
2. Select your project
3. Click **Deployments**
4. Click the three dots on the latest deployment
5. Click **Redeploy**
6. Wait for deployment to complete

## Step 7: Test on Vercel

1. Go to https://expense-tracker-rho-brown.vercel.app
2. Try to register a new account
3. Try to login
4. If successful, you're all set!

## Troubleshooting

### "Connection refused" error
- Check DATABASE_URL is correct in Vercel environment variables
- Verify Supabase project is active (check dashboard)
- Wait 5 minutes after adding env vars to Vercel

### "Authentication failed" error
- Verify password in connection string matches Supabase database password
- Check for special characters in password (may need URL encoding)

### Tables not created
- Check server logs in Vercel for errors
- Verify DATABASE_URL format is correct
- Try redeploying

## Connection String Format

Your connection string should look like:
```
postgresql://postgres:PASSWORD@HOST:5432/postgres
```

Where:
- `postgres` = default username
- `PASSWORD` = your database password
- `HOST` = your Supabase host (e.g., `db.xxxxx.supabase.co`)
- `5432` = default PostgreSQL port
- `postgres` = default database name
