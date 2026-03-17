# 🎯 Quick Reference Card - Supabase Setup

## 📍 Important Links

| What | Link |
|------|------|
| Supabase | https://supabase.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Your App | https://expense-tracker-rho-brown.vercel.app |
| Resend API Key | `re_bP4aXCGt_5Y9xPnfTFRnqM1RLdLUSKXZ3` |

---

## 🔑 Environment Variables

### Local (.env)
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET=your-generated-secret-key
RESEND_API_KEY=re_bP4aXCGt_5Y9xPnfTFRnqM1RLdLUSKXZ3
CORS_ORIGIN=https://expense-tracker-rho-brown.vercel.app
FRONTEND_URL=https://expense-tracker-rho-brown.vercel.app
```

### Vercel
```
DATABASE_URL = postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET = your-generated-secret-key
RESEND_API_KEY = re_bP4aXCGt_5Y9xPnfTFRnqM1RLdLUSKXZ3
VITE_API_URL = https://expense-tracker-rho-brown.vercel.app
NODE_ENV = production
VERCEL = 1
```

---

## 🚀 Quick Steps

### 1. Create Supabase Project
```
1. Go to https://supabase.com
2. Sign up → Create project
3. Save database password
4. Wait 2-3 minutes
```

### 2. Get Connection String
```
1. Settings → Database → Connection string → URI
2. Replace [YOUR-PASSWORD] with password
3. Copy full string
```

### 3. Update Local .env
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

### 4. Test Locally
```
npm start
# Should show: ✓ Database initialization complete
```

### 5. Generate JWT_SECRET
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Add to Vercel
```
1. Vercel Dashboard → Settings → Environment Variables
2. Add DATABASE_URL
3. Add JWT_SECRET
4. Redeploy
```

### 7. Test on Vercel
```
1. Go to https://expense-tracker-rho-brown.vercel.app
2. Try register/login
3. If works, you're done! ✅
```

---

## 🔍 Connection String Format

```
postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
│           │        │            │                      │    │
│           │        │            │                      │    └─ Database
│           │        │            │                      └────── Port
│           │        │            └──────────────────────────── Host
│           │        └───────────────────────────────────────── Password
│           └──────────────────────────────────────────────────── Username
└─────────────────────────────────────────────────────────────── Protocol
```

---

## ✅ Verification Checklist

- [ ] Supabase account created
- [ ] Project created with password saved
- [ ] Connection string copied
- [ ] Local .env updated
- [ ] npm start shows "Database initialization complete"
- [ ] Can register/login locally
- [ ] DATABASE_URL added to Vercel
- [ ] JWT_SECRET added to Vercel
- [ ] Vercel redeployed
- [ ] Can register/login on Vercel
- [ ] ✅ Done!

---

## 🆘 Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| "Connection refused" | Check DATABASE_URL in Vercel, wait 5 min, redeploy |
| "Auth failed" | Verify password in DATABASE_URL matches Supabase |
| "Tables not created" | Redeploy Vercel, check logs |
| "CORS error" | Check CORS_ORIGIN matches frontend URL |
| "Token expired" | Clear localStorage, login again |

---

## 📊 What Gets Created

### Supabase Tables
- `users` - User accounts
- `expenses` - Expense records
- `budgets` - Budget settings
- `recurring_expenses` - Recurring expenses

### Vercel Functions
- `/api/auth/*` - Login, register, verify
- `/api/expenses/*` - CRUD operations
- `/api/budget/*` - Budget management
- `/api/recurring-expenses/*` - Recurring expenses
- `/api/export/*` - CSV export

---

## 🎯 Success Indicators

### Local
- ✅ `npm start` shows "Database initialization complete"
- ✅ Can register at http://localhost:5173
- ✅ Can login with registered account
- ✅ Can add expenses

### Vercel
- ✅ Can register at https://expense-tracker-rho-brown.vercel.app
- ✅ Can login with registered account
- ✅ Can add expenses
- ✅ Expenses persist after refresh

---

## 📝 Important Notes

1. **Save Supabase password** - You'll need it
2. **Keep JWT_SECRET secret** - Don't share it
3. **Never commit .env** - It's in .gitignore
4. **Wait 5 minutes** after adding env vars to Vercel
5. **Test locally first** before deploying

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| START-HERE-SUPABASE.md | Overview & quick links |
| SUPABASE-CONNECTION-STEPS.md | Step-by-step guide ⭐ |
| QUICK-SETUP-CARD.md | TL;DR version |
| SETUP-VISUAL-GUIDE.md | Diagrams & explanations |
| VERCEL-ENV-VARIABLES.md | Env vars reference |
| TROUBLESHOOTING-FLOWCHART.md | Problem solving |
| SETUP-CHECKLIST.md | Printable checklist |
| BACKEND-MIGRATION-COMPLETE.md | Complete overview |

---

## ⏱️ Time Estimate

- Create Supabase: 5 min
- Get connection string: 2 min
- Update local .env: 1 min
- Test locally: 2 min
- Generate JWT_SECRET: 1 min
- Add to Vercel: 3 min
- Redeploy: 3 min
- Test on Vercel: 2 min
- **TOTAL: ~20 minutes**

---

## 🎓 Key Concepts

**Supabase** = Free PostgreSQL database in the cloud
**Vercel** = Your app is hosted here
**Connection String** = How backend connects to database
**JWT_SECRET** = Secret key for authentication tokens
**Environment Variables** = Configuration values for different environments

---

## 🔐 Security Checklist

- [ ] .env file not committed to GitHub
- [ ] JWT_SECRET is strong and unique
- [ ] Database password is strong
- [ ] 2FA enabled on Supabase
- [ ] Environment variables not logged
- [ ] CORS_ORIGIN is correct

---

## 📞 Resources

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Node.js Docs: https://nodejs.org/docs/

---

**Print this card and keep it handy!** 📋

**Start with: SUPABASE-CONNECTION-STEPS.md** 👈
