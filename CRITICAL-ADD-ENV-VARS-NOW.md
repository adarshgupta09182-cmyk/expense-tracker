# 🚨 CRITICAL: Add Environment Variables to Vercel NOW

## ⚠️ Why It's Still Failing

Your backend can't connect to Supabase because **environment variables are NOT set in Vercel**.

The 405 error is just a symptom of the real problem: **no database connection**.

---

## 🎯 What to Do RIGHT NOW

### Go to Vercel

https://vercel.com/dashboard

### Click Your Project

**expense-tracker**

### Go to Settings

Click **Settings** (top menu)

### Go to Environment Variables

Click **Environment Variables** (left sidebar)

---

## 📝 Add 6 Variables

### 1. DATABASE_URL
```
postgresql://postgres:%40Adarsh24042007%23@db.nimsghcrjqfvffbhnujw.supabase.co:5432/postgres
```

### 2. JWT_SECRET
Generate:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Paste the output

### 3. RESEND_API_KEY
```
re_bP4aXCGt_5Y9xPnfTFRnqM1RLdLUSKXZ3
```

### 4. VITE_API_URL
```
https://expense-tracker-rho-brown.vercel.app
```

### 5. NODE_ENV
```
production
```

### 6. VERCEL
```
1
```

---

## 🔄 After Adding

1. Go to **Deployments**
2. Click **three dots** on latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes

---

## 🧪 Test

https://expense-tracker-rho-brown.vercel.app

Try register/login

---

## ✅ This Will Fix It

Once you add these variables and redeploy:
- ✅ Database connects
- ✅ 405 error goes away
- ✅ Registration works
- ✅ Login works

---

**DO THIS NOW!** 👉 https://vercel.com/dashboard
