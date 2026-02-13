# PostgreSQL Migration - Complete Checklist

## Pre-Migration Checklist

- [ ] You have access to https://railway.app
- [ ] Your expense-tracker project is visible on Railway
- [ ] You have the current backend URL: https://web-production-43d51.up.railway.app
- [ ] You have the current frontend URL: https://expense-tracker-rho-brown.vercel.app
- [ ] You can access your GitHub repository

---

## Migration Checklist

### Phase 1: Add PostgreSQL to Railway (5 minutes)

- [ ] Go to https://railway.app
- [ ] Click on your "expense-tracker" project
- [ ] Click **+ New** button
- [ ] Select **Database** → **PostgreSQL**
- [ ] Wait for PostgreSQL service to initialize (30-60 seconds)
- [ ] Verify PostgreSQL service appears in your project

### Phase 2: Get Connection String (2 minutes)

- [ ] Click on **PostgreSQL** service
- [ ] Click **Connect** tab
- [ ] Find the **Database URL** section
- [ ] **Copy the entire connection string**
- [ ] Example format: `postgresql://postgres:abc123xyz@containers-us-west-45.railway.app:6543/railway`
- [ ] Save it somewhere safe (you'll need it in next step)

### Phase 3: Add DATABASE_URL to Web Service (3 minutes)

- [ ] Click on **web** service (your Node.js app)
- [ ] Click **Variables** tab
- [ ] Click **Add Variable** button
- [ ] **Name:** `DATABASE_URL`
- [ ] **Value:** (paste the connection string from Phase 2)
- [ ] Click **Save** or **Deploy**
- [ ] Watch the logs - service should redeploy automatically
- [ ] Wait for "Deployment successful" message

### Phase 4: Switch to PostgreSQL Server (2 minutes)

- [ ] Open your project in code editor
- [ ] Rename `server.js` → `server-json.js` (backup)
- [ ] Rename `server-postgres.js` → `server.js`
- [ ] Run: `git add .`
- [ ] Run: `git commit -m "Migrate to PostgreSQL database"`
- [ ] Run: `git push`
- [ ] Watch Railway logs - app should redeploy with PostgreSQL
- [ ] Wait for "Deployment successful" message

### Phase 5: Verify Migration (5 minutes)

- [ ] Go to https://expense-tracker-rho-brown.vercel.app
- [ ] Try to login with: `test@example.com` / `test123456`
- [ ] Dashboard should load successfully
- [ ] Click "Add Expense"
- [ ] Fill in form with test data
- [ ] Click "Add" button
- [ ] Expense appears in the table
- [ ] Refresh the page (F5 or Ctrl+R)
- [ ] Expense is still there ✅
- [ ] Go to Railway and manually redeploy web service
- [ ] Wait for redeploy to complete
- [ ] Go back to app and refresh
- [ ] Expense is STILL there ✅ (confirms PostgreSQL persistence)

### Phase 6: Test All Features

- [ ] Login works
- [ ] Add expense works
- [ ] Edit expense works
- [ ] Delete expense works
- [ ] Filter expenses works
- [ ] Export to CSV works
- [ ] Budget settings work
- [ ] Dark mode toggle works
- [ ] Logout works
- [ ] Register new user works

---

## Post-Migration Verification

### Data Persistence Test
- [ ] Add an expense
- [ ] Refresh page - expense persists
- [ ] Redeploy app on Railway
- [ ] Expense still exists after redeploy
- [ ] ✅ PostgreSQL is working!

### Performance Check
- [ ] App loads faster than before
- [ ] No file I/O delays
- [ ] Queries are responsive

### Backup Confirmation
- [ ] `server-json.js` exists (backup of old server)
- [ ] `users.json` still exists (backup of old data)
- [ ] `expenses.json` still exists (backup of old data)
- [ ] All files are committed to Git

---

## Troubleshooting Checklist

### If Login Fails

- [ ] Check Railway logs for errors
- [ ] Verify DATABASE_URL is set on web service
- [ ] Verify connection string is correct (no typos)
- [ ] Check that PostgreSQL service is running (green status)
- [ ] Try copying connection string again from Railway

### If Data Doesn't Persist

- [ ] Verify DATABASE_URL is set correctly
- [ ] Check PostgreSQL service is running
- [ ] Look at Railway logs for SQL errors
- [ ] Verify you're using `server.js` (not `server-json.js`)
- [ ] Check that tables were created (should see in logs)

### If App Won't Start

- [ ] Check Railway logs for error messages
- [ ] Verify `server.js` is the PostgreSQL version
- [ ] Verify `package.json` has `pg` dependency
- [ ] Check that DATABASE_URL environment variable is set
- [ ] Try restarting the web service manually

### If Connection String is Wrong

- [ ] Go back to PostgreSQL service on Railway
- [ ] Click "Connect" tab
- [ ] Copy the Database URL again
- [ ] Make sure there are no extra spaces
- [ ] Update DATABASE_URL on web service
- [ ] Redeploy

---

## Rollback Checklist (If Needed)

If you need to go back to JSON storage:

- [ ] Rename `server.js` → `server-postgres.js`
- [ ] Rename `server-json.js` → `server.js`
- [ ] Run: `git add .`
- [ ] Run: `git commit -m "Rollback to JSON storage"`
- [ ] Run: `git push`
- [ ] Wait for Railway to redeploy
- [ ] App should work with old JSON data

---

## Final Verification

- [ ] ✅ PostgreSQL service is running on Railway
- [ ] ✅ DATABASE_URL is set on web service
- [ ] ✅ `server.js` is the PostgreSQL version
- [ ] ✅ App deploys successfully
- [ ] ✅ Login works
- [ ] ✅ Data persists after refresh
- [ ] ✅ Data persists after redeploy
- [ ] ✅ All features work correctly

---

## Success Indicators

You'll know the migration is successful when:

1. ✅ App loads without errors
2. ✅ Login works with existing users
3. ✅ New expenses are added successfully
4. ✅ Expenses persist after page refresh
5. ✅ Expenses persist after app redeploy
6. ✅ No "file not found" errors in logs
7. ✅ No "connection refused" errors in logs
8. ✅ All features work as before

---

## Next Steps After Migration

1. **Monitor for Issues**
   - Watch Railway logs for the next 24 hours
   - Check for any SQL errors or connection issues

2. **Test Thoroughly**
   - Add multiple expenses
   - Test all features
   - Try on different devices

3. **Backup Strategy**
   - Keep `server-json.js` as backup
   - Keep `users.json` and `expenses.json` as backup
   - These are committed to Git for safety

4. **Optional: Clean Up**
   - After confirming everything works, you can delete:
     - `server-json.js` (if you're confident)
     - `preserve-data.js` (no longer needed)
   - But it's safer to keep them as backups

---

## Support Resources

- **PostgreSQL Migration Guide:** `POSTGRESQL-MIGRATION.md`
- **Connection String Reference:** `CONNECTION-STRING-QUICK-REFERENCE.md`
- **Railway Documentation:** https://docs.railway.app
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/

---

## Questions?

If you get stuck at any step:

1. Check the troubleshooting section above
2. Read the detailed guide: `POSTGRESQL-MIGRATION.md`
3. Check Railway logs for error messages
4. Verify all environment variables are set correctly

**You've got this! 🚀**

