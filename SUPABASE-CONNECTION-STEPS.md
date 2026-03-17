# Supabase Connection - Step by Step Visual Guide

## 🎯 Goal
Connect your Expense Tracker to Supabase PostgreSQL database so login/registration works.

---

## ✅ Step 1: Create Supabase Account & Project

### 1.1 Go to Supabase
- Open https://supabase.com
- Click **"Start your project"** or **"Sign Up"**

### 1.2 Sign In
- Use GitHub, Google, or email
- Complete verification if needed

### 1.3 Create New Project
- Click **"New Project"** button
- Fill in:
  - **Project Name**: `expense-tracker`
  - **Database Password**: `YourStrongPassword123!` (save this!)
  - **Region**: Pick closest to you
  - **Pricing**: Select **Free** tier
- Click **"Create new project"**
- ⏳ Wait 2-3 minutes for setup

---

## 📋 Step 2: Get Connection String

### 2.1 Open Project Settings
- In Supabase dashboard, click **Settings** (bottom left)
- Click **"Database"** tab

### 2.2 Find Connection String
- Scroll down to **"Connection string"**
- Click **"URI"** tab
- You'll see something like:
  ```
  postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
  ```

### 2.3 Replace Password
- Replace `[YOUR-PASSWORD]` with the password from Step 1.3
- Example:
  ```
  postgresql://postgres:YourStrongPassword123!@db.xxxxx.supabase.co:5432/postgres
  ```

### 2.4 Copy Full String
- Copy the entire connection string
- Save it somewhere safe (you'll need it twice)

---

## 🖥️ Step 3: Update Local .env File

### 3.1 Open .env File
- In your project root, open `.env`
- Find or add this line:
  ```env
  DATABASE_URL=
  ```

### 3.2 Add Connection String
- Paste your Supabase connection string:
  ```env
  DATABASE_URL=postgresql://postgres:YourStrongPassword123!@db.xxxxx.supabase.co:5432/postgres
  ```

### 3.3 Save File
- Save the `.env` file

---

## 🧪 Step 4: Test Local Connection

### 4.1 Stop Server (if running)
- Press `Ctrl+C` in terminal

### 4.2 Start Server
- Run: `npm start`
- Look for these messages in console:
  ```
  ✓ Initializing PostgreSQL database...
  ✓ Users table ready
  ✓ Expenses table ready
  ✓ Budgets table ready
  ✓ Recurring expenses table ready
  ✓ Database initialization complete
  ```

### 4.3 Test Registration
- Go to http://localhost:5173
- Click **Register**
- Create a test account
- If successful, database is working locally!

---

## 🚀 Step 5: Add to Vercel

### 5.1 Open Vercel Dashboard
- Go to https://vercel.com/dashboard
- Click **expense-tracker** project

### 5.2 Go to Settings
- Click **Settings** (top menu)
- Click **Environment Variables** (left sidebar)

### 5.3 Add DATABASE_URL
- Click **"Add New"**
- **Name**: `DATABASE_URL`
- **Value**: Paste your Supabase connection string
- Click **"Save"**

### 5.4 Add JWT_SECRET
- Click **"Add New"**
- **Name**: `JWT_SECRET`
- **Value**: Generate with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Click **"Save"**

### 5.5 Verify Other Variables
- Check these are already set:
  - `RESEND_API_KEY`: `re_bP4aXCGt_5Y9xPnfTFRnqM1RLdLUSKXZ3`
  - `VITE_API_URL`: `https://expense-tracker-rho-brown.vercel.app`
  - `NODE_ENV`: `production`
  - `VERCEL`: `1`

---

## 🔄 Step 6: Redeploy on Vercel

### 6.1 Go to Deployments
- Click **Deployments** tab (top menu)

### 6.2 Redeploy
- Find the latest deployment
- Click the **three dots** (⋯)
- Click **"Redeploy"**
- ⏳ Wait 2-3 minutes

### 6.3 Check Status
- When it says **"Ready"**, deployment is complete

---

## ✨ Step 7: Test on Vercel

### 7.1 Open Your App
- Go to https://expense-tracker-rho-brown.vercel.app

### 7.2 Test Registration
- Click **Register**
- Create a test account with:
  - Name: `Test User`
  - Email: `test@example.com`
  - Password: `TestPass123!`
- Click **Register**

### 7.3 Test Login
- If registration works, try **Login**
- Use the same email and password
- If login works, you're done! 🎉

---

## 🆘 Troubleshooting

### Problem: "Connection refused"
**Solution**:
1. Check DATABASE_URL is correct in Vercel
2. Wait 5 minutes after adding env vars
3. Redeploy again

### Problem: "Authentication failed"
**Solution**:
1. Verify password in DATABASE_URL matches Supabase
2. Check for special characters (may need URL encoding)
3. Copy connection string again from Supabase

### Problem: "Tables not created"
**Solution**:
1. Check Vercel logs for errors
2. Verify DATABASE_URL format is correct
3. Try redeploying

### Problem: Still not working?
**Solution**:
1. Check all 6 environment variables are in Vercel
2. Verify DATABASE_URL has correct password
3. Check Supabase project is active
4. Try redeploying one more time

---

## 📝 Checklist

- [ ] Created Supabase account
- [ ] Created Supabase project
- [ ] Got connection string from Supabase
- [ ] Updated local `.env` with DATABASE_URL
- [ ] Tested local registration/login
- [ ] Added DATABASE_URL to Vercel
- [ ] Added JWT_SECRET to Vercel
- [ ] Verified other env variables in Vercel
- [ ] Redeployed on Vercel
- [ ] Tested registration on Vercel
- [ ] Tested login on Vercel
- [ ] ✅ All working!

---

## 🎓 What Happens Next

Once connected:
1. **Tables auto-create** in Supabase when you first register
2. **Data persists** - your expenses stay even after restart
3. **Multi-user** - each user has their own data
4. **Backups** - Supabase handles automatic backups
5. **Scalable** - can handle thousands of users

Enjoy your Expense Tracker! 🎉
