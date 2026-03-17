# Troubleshooting Flowchart - Supabase Setup

## 🔍 Problem: Login/Registration Not Working

```
START
  │
  ├─ Is DATABASE_URL in your local .env?
  │  ├─ NO → Add it from Supabase → Test again
  │  └─ YES ↓
  │
  ├─ Does "npm start" show "Database initialization complete"?
  │  ├─ NO → Check connection string format
  │  │       └─ Should be: postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
  │  │       └─ Redeploy Vercel
  │  └─ YES ↓
  │
  ├─ Can you register locally at http://localhost:5173?
  │  ├─ NO → Check server logs for errors
  │  │       └─ Verify DATABASE_URL password matches Supabase
  │  │       └─ Try restarting server
  │  └─ YES ↓
  │
  ├─ Can you login locally?
  │  ├─ NO → Check if user was created in Supabase
  │  │       └─ Go to Supabase → SQL Editor → SELECT * FROM users;
  │  │       └─ If no users, registration failed
  │  └─ YES ↓
  │
  ├─ Is DATABASE_URL in Vercel environment variables?
  │  ├─ NO → Add it now
  │  │       └─ Go to Vercel → Settings → Environment Variables
  │  │       └─ Add DATABASE_URL
  │  │       └─ Redeploy
  │  └─ YES ↓
  │
  ├─ Is JWT_SECRET in Vercel environment variables?
  │  ├─ NO → Generate and add it
  │  │       └─ Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  │  │       └─ Add to Vercel
  │  │       └─ Redeploy
  │  └─ YES ↓
  │
  ├─ Did you redeploy Vercel after adding env vars?
  │  ├─ NO → Redeploy now
  │  │       └─ Go to Vercel → Deployments → Redeploy
  │  │       └─ Wait 2-3 minutes
  │  │       └─ Test again
  │  └─ YES ↓
  │
  ├─ Can you register on Vercel at https://expense-tracker-rho-brown.vercel.app?
  │  ├─ NO → Check Vercel logs
  │  │       └─ Go to Vercel → Deployments → Click latest → Logs
  │  │       └─ Look for error messages
  │  │       └─ See "Advanced Troubleshooting" below
  │  └─ YES ↓
  │
  ├─ Can you login on Vercel?
  │  ├─ NO → Check if user was created
  │  │       └─ Go to Supabase → SQL Editor
  │  │       └─ Run: SELECT * FROM users;
  │  │       └─ If user exists, check password hash
  │  └─ YES ↓
  │
  └─ ✅ SUCCESS! Everything is working!
```

---

## 🔧 Advanced Troubleshooting

### Issue: "Connection refused" Error

**Diagnosis**:
```
Error: connect ECONNREFUSED
```

**Causes**:
1. DATABASE_URL not set in Vercel
2. Wrong connection string format
3. Supabase project not active
4. Firewall blocking connection

**Solutions**:
```
1. Check Vercel environment variables
   └─ Go to Settings → Environment Variables
   └─ Verify DATABASE_URL exists
   └─ Verify format is correct

2. Check connection string format
   └─ Should be: postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
   └─ Should NOT have spaces or quotes
   └─ Should have PASSWORD replaced with actual password

3. Check Supabase project status
   └─ Go to https://supabase.com/dashboard
   └─ Verify project is active (not paused)
   └─ Check project is in correct region

4. Wait and redeploy
   └─ Wait 5 minutes after adding env vars
   └─ Redeploy Vercel project
   └─ Check logs again
```

---

### Issue: "Authentication failed" Error

**Diagnosis**:
```
Error: password authentication failed for user "postgres"
```

**Causes**:
1. Wrong password in connection string
2. Password has special characters not URL-encoded
3. Password changed in Supabase

**Solutions**:
```
1. Verify password in connection string
   └─ Go to Supabase → Settings → Database
   └─ Check "Connection string" section
   └─ Copy fresh connection string
   └─ Replace [YOUR-PASSWORD] with actual password
   └─ Paste into Vercel DATABASE_URL

2. Check for special characters
   └─ If password has: @ # $ % ^ & * ( ) etc.
   └─ May need URL encoding
   └─ Example: @ becomes %40
   └─ Use: https://www.urlencoder.org/

3. Reset password if needed
   └─ Go to Supabase → Settings → Database
   └─ Click "Reset password"
   └─ Create new password
   └─ Update DATABASE_URL everywhere
```

---

### Issue: "Tables not created" Error

**Diagnosis**:
```
Error: relation "users" does not exist
```

**Causes**:
1. Database connection failed
2. Initialization script didn't run
3. Permissions issue

**Solutions**:
```
1. Check database connection
   └─ Verify DATABASE_URL is correct
   └─ Test locally first: npm start
   └─ Check console for "Database initialization complete"

2. Force table creation
   └─ Go to Supabase → SQL Editor
   └─ Run the SQL from server.js initializeDatabase()
   └─ Or redeploy Vercel to trigger initialization

3. Check permissions
   └─ Go to Supabase → Settings → Database
   └─ Verify user "postgres" has full permissions
   └─ Usually default, but check if custom role used
```

---

### Issue: "CORS Error" in Browser Console

**Diagnosis**:
```
Access to XMLHttpRequest blocked by CORS policy
```

**Causes**:
1. CORS_ORIGIN not set correctly
2. Frontend URL doesn't match CORS_ORIGIN
3. Backend not sending CORS headers

**Solutions**:
```
1. Check CORS_ORIGIN in .env
   └─ Should be: https://expense-tracker-rho-brown.vercel.app
   └─ Should NOT have trailing slash
   └─ Should NOT have /api or other paths

2. Check VITE_API_URL in Vercel
   └─ Should be: https://expense-tracker-rho-brown.vercel.app
   └─ Should match CORS_ORIGIN

3. Verify server.js has CORS enabled
   └─ Check for: app.use(cors({ origin: process.env.CORS_ORIGIN }))
   └─ If missing, add it

4. Redeploy after changes
   └─ Changes to .env require redeploy
```

---

### Issue: "Token Expired" or "Invalid Token"

**Diagnosis**:
```
Error: jwt malformed
Error: jwt expired
```

**Causes**:
1. JWT_SECRET changed
2. Token stored in localStorage is old
3. JWT_SECRET not set in Vercel

**Solutions**:
```
1. Clear browser storage
   └─ Open DevTools (F12)
   └─ Go to Application → Local Storage
   └─ Delete all entries
   └─ Refresh page
   └─ Try login again

2. Verify JWT_SECRET in Vercel
   └─ Go to Settings → Environment Variables
   └─ Check JWT_SECRET exists
   └─ If changed, redeploy

3. Generate new JWT_SECRET
   └─ Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   └─ Update in Vercel
   └─ Redeploy
   └─ Users will need to login again
```

---

### Issue: "Email Verification Failed"

**Diagnosis**:
```
Error: Failed to send verification email
```

**Causes**:
1. RESEND_API_KEY not set
2. EMAIL_FROM not verified in Resend
3. Email service down

**Solutions**:
```
1. Check RESEND_API_KEY in Vercel
   └─ Should be: re_bP4aXCGt_5Y9xPnfTFRnqM1RLdLUSKXZ3
   └─ If missing, add it
   └─ Redeploy

2. Check EMAIL_FROM in .env
   └─ Should be: noreply@expensetracker.com
   └─ Or any verified email in Resend

3. Verify email in Resend
   └─ Go to https://resend.com
   └─ Check "Domains" section
   └─ Verify domain is active
   └─ Add email if needed

4. Check Resend status
   └─ Go to https://status.resend.com
   └─ Check if service is up
```

---

## 📊 Verification Checklist

### Local Setup
```
✅ npm install completed
✅ .env file has DATABASE_URL
✅ npm start shows "Database initialization complete"
✅ Can register at http://localhost:5173
✅ Can login with registered account
✅ Can add expenses
✅ Expenses appear in list
```

### Vercel Setup
```
✅ DATABASE_URL in Vercel env vars
✅ JWT_SECRET in Vercel env vars
✅ RESEND_API_KEY in Vercel env vars
✅ VITE_API_URL in Vercel env vars
✅ NODE_ENV = production
✅ VERCEL = 1
✅ Project redeployed after adding vars
```

### Supabase Setup
```
✅ Account created
✅ Project created
✅ Database password saved
✅ Connection string copied correctly
✅ Password in connection string matches Supabase
✅ Project is active (not paused)
```

### Final Testing
```
✅ Can register on https://expense-tracker-rho-brown.vercel.app
✅ Can login on https://expense-tracker-rho-brown.vercel.app
✅ Can add expenses
✅ Expenses persist after refresh
✅ Can view budget
✅ Can export expenses
```

---

## 🆘 Still Not Working?

### Step 1: Gather Information
```
1. What error message do you see?
2. Where does it appear? (browser console, server logs, Vercel logs)
3. What were you trying to do? (register, login, add expense)
4. When did it start? (after setup, after redeploy, always)
```

### Step 2: Check Logs
```
Local:
└─ npm start output
└─ Browser console (F12)
└─ Network tab (F12 → Network)

Vercel:
└─ Go to Deployments → Click latest → Logs
└─ Look for error messages
└─ Check timestamps
```

### Step 3: Verify Setup
```
1. DATABASE_URL format correct?
2. Password in DATABASE_URL matches Supabase?
3. All 6 env vars in Vercel?
4. Vercel redeployed after adding vars?
5. Waited 5 minutes after changes?
```

### Step 4: Try Again
```
1. Clear browser cache (Ctrl+Shift+Delete)
2. Clear localStorage (DevTools → Application → Local Storage → Clear All)
3. Refresh page (Ctrl+F5)
4. Try again
```

---

## 📞 Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Node.js Docs**: https://nodejs.org/docs/

---

**Still stuck? Read SUPABASE-CONNECTION-STEPS.md for detailed step-by-step guide!**
