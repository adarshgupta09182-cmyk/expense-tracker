# Quick Setup Card - Supabase + Vercel

## 🚀 TL;DR - 3 Steps to Get Running

### Step 1: Create Supabase Project (5 min)
```
1. Go to https://supabase.com
2. Sign up → Create project
3. Save database password
4. Wait 2-3 minutes
```

### Step 2: Get Connection String
```
1. Settings → Database → Connection string → URI
2. Replace [YOUR-PASSWORD] with your password
3. Copy the full string
```

### Step 3: Add to .env & Vercel
```
Local .env:
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres

Vercel:
1. Settings → Environment Variables
2. Add DATABASE_URL (paste connection string)
3. Add JWT_SECRET (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
4. Redeploy
```

---

## 📋 Checklist

- [ ] Supabase account created
- [ ] Project created with password saved
- [ ] Connection string copied
- [ ] Local .env updated with DATABASE_URL
- [ ] npm start works (shows "Database initialization complete")
- [ ] Can register/login locally
- [ ] DATABASE_URL added to Vercel
- [ ] JWT_SECRET added to Vercel
- [ ] Vercel redeployed
- [ ] Can register/login on Vercel
- [ ] ✅ Done!

---

## 🔗 Important Links

| What | Link |
|------|------|
| Supabase | https://supabase.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Your App | https://expense-tracker-rho-brown.vercel.app |
| Resend API Key | `re_bP4aXCGt_5Y9xPnfTFRnqM1RLdLUSKXZ3` |

---

## 📚 Full Guides

- **SUPABASE-CONNECTION-STEPS.md** - Step-by-step visual guide
- **VERCEL-ENV-VARIABLES.md** - Environment variables reference
- **BACKEND-MIGRATION-COMPLETE.md** - Complete overview

---

## 🆘 Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| "Connection refused" | Check DATABASE_URL in Vercel, wait 5 min, redeploy |
| "Auth failed" | Verify password in DATABASE_URL matches Supabase |
| "Tables not created" | Redeploy Vercel, check logs |
| Still not working | Verify all 6 env vars in Vercel, redeploy again |

---

## 💡 Pro Tips

1. **Test locally first** before deploying to Vercel
2. **Save your Supabase password** somewhere safe
3. **Generate a strong JWT_SECRET** - don't use simple strings
4. **Wait 5 minutes** after adding env vars to Vercel
5. **Check Vercel logs** if something fails

---

**Start with SUPABASE-CONNECTION-STEPS.md for detailed instructions!**
