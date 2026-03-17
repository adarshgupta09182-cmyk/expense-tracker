# 🔧 Add Environment Variables to Vercel - CRITICAL STEP

## ⚠️ Important

The 405 error persists because **your environment variables are NOT set in Vercel yet**.

The backend can't connect to Supabase without `DATABASE_URL`.

---

## 🎯 What You Need to Do NOW

### Step 1: Go to Vercel Dashboard

https://vercel.com/dashboard

### Step 2: Click Your Project

Click **expense-tracker**

### Step 3: Go to Settings

Click **Settings** (top menu bar)

### Step 4: Click Environment Variables

Click **Environment Variables** (left sidebar)

---

## 📝 Add These Variables

You need to add **6 environment variables**:

### 1. DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: 
  ```
  postgresql://postgres:%40Adarsh24042007%23@db.nimsghcrjqfvffbhnujw.supabase.co:5432/postgres
  ```
- Click **"Add"**

### 2. JWT_SECRET
- **Name**: `JWT_SECRET`
- **Value**: Generate with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Copy the output and paste it
- Click **"Add"**

### 3. RESEND_API_KEY
- **Name**: `RESEND_API_KEY`
- **Value**: 
  ```
  re_bP4aXCGt_5Y9xPnfTFRnqM1RLdLUSKXZ3
  ```
- Click **"Add"**

### 4. VITE_API_URL
- **Name**: `VITE_API_URL`
- **Value**: 
  ```
  https://expense-tracker-rho-brown.vercel.app
  ```
- Click **"Add"**

### 5. NODE_ENV
- **Name**: `NODE_ENV`
- **Value**: 
  ```
  production
  ```
- Click **"Add"**

### 6. VERCEL
- **Name**: `VERCEL`
- **Value**: 
  ```
  1
  ```
- Click **"Add"**

---

## ✅ Verification

After adding all 6 variables, you should see:

```
✓ DATABASE_URL
✓ JWT_SECRET
✓ RESEND_API_KEY
✓ VITE_API_URL
✓ NODE_ENV
✓ VERCEL
```

---

## 🚀 After Adding Variables

### Step 1: Go to Deployments

Click **Deployments** (top menu)

### Step 2: Redeploy

Find the latest deployment and click the **three dots** (⋯)

Click **"Redeploy"**

### Step 3: Wait

⏳ Wait 2-3 minutes for deployment to complete

### Step 4: Test

Go to: https://expense-tracker-rho-brown.vercel.app

Try to:
- Register
- Login
- Add expense

---

## 📋 Checklist

- [ ] Opened Vercel dashboard
- [ ] Clicked expense-tracker project
- [ ] Went to Settings → Environment Variables
- [ ] Added DATABASE_URL
- [ ] Added JWT_SECRET
- [ ] Added RESEND_API_KEY
- [ ] Added VITE_API_URL
- [ ] Added NODE_ENV
- [ ] Added VERCEL
- [ ] Went to Deployments
- [ ] Clicked Redeploy
- [ ] Waited 2-3 minutes
- [ ] Tested registration
- [ ] Tested login
- [ ] ✅ Success!

---

## 🔑 Your Connection String

```
postgresql://postgres:%40Adarsh24042007%23@db.nimsghcrjqfvffbhnujw.supabase.co:5432/postgres
```

**Copy this exactly** (with `%40` and `%23`)

---

## ⏱️ Time Estimate

- Add variables: 5 minutes
- Redeploy: 3 minutes
- Test: 2 minutes
- **TOTAL: ~10 minutes**

---

## 🆘 If You Get Stuck

1. Make sure you're in the right project (expense-tracker)
2. Make sure you're in Settings → Environment Variables
3. Make sure you click "Add" after each variable
4. Make sure you wait 2-3 minutes after redeploy

---

**This is the critical step that will fix everything!** 🚀

**Go to Vercel now and add the environment variables!**

https://vercel.com/dashboard
