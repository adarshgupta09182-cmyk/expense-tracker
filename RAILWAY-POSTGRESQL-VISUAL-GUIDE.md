# Railway PostgreSQL Setup - Visual Step-by-Step Guide

## What You'll See on Each Step

---

## STEP 1: Go to Railway Dashboard

### What to Do
1. Open https://railway.app in your browser
2. Log in with your account

### What You'll See
- Railway dashboard with your projects listed
- You should see "expense-tracker" project

---

## STEP 2: Open Your Project

### What to Do
1. Click on the "expense-tracker" project

### What You'll See
- Your project opens
- You see a canvas with services
- Currently you should see:
  - **web** service (your Node.js app) - usually blue
  - **PostgreSQL** service (if you already added it) - usually green

---

## STEP 3: Add PostgreSQL Database

### What to Do
1. Look for the **+ New** button (usually top right)
2. Click it

### What You'll See
- A menu appears with options:
  - Database
  - Service
  - GitHub Repo
  - etc.

### What to Do Next
1. Click **Database**

### What You'll See
- Another menu appears with database options:
  - PostgreSQL
  - MySQL
  - MongoDB
  - Redis
  - etc.

### What to Do Next
1. Click **PostgreSQL**

### What You'll See
- Railway creates a PostgreSQL service
- You see a loading animation
- After 30-60 seconds, a new "PostgreSQL" service appears on your canvas
- It should have a green status indicator

---

## STEP 4: Get Your Connection String

### What to Do
1. Click on the **PostgreSQL** service (the new one you just created)

### What You'll See
- The PostgreSQL service details open
- You see several tabs at the top:
  - Overview
  - Connect
  - Logs
  - Settings
  - etc.

### What to Do Next
1. Click the **Connect** tab

### What You'll See
- The Connect tab opens
- You see several sections:
  - **Database URL** (this is what you need!)
  - **Connection String** (same thing)
  - **PSQL Command** (for terminal)
  - **Environment Variables** (for code)

### What to Do Next
1. Find the **Database URL** section
2. You'll see a long string that looks like:
   ```
   postgresql://postgres:abc123xyz@containers-us-west-45.railway.app:6543/railway
   ```
3. Click the copy icon (📋) next to it
4. Or manually select and copy the text

### What You'll See
- The connection string is copied to your clipboard
- You might see a "Copied!" notification

---

## STEP 5: Add DATABASE_URL to Web Service

### What to Do
1. Click on the **web** service (your Node.js app)

### What You'll See
- The web service details open
- You see several tabs:
  - Overview
  - Connect
  - Logs
  - Settings
  - **Variables** (this is what you need!)

### What to Do Next
1. Click the **Variables** tab

### What You'll See
- The Variables tab opens
- You see existing variables:
  - `CORS_ORIGIN` (already set)
  - `JWT_SECRET` (already set)
  - `NODE_ENV` (already set)
  - etc.
- You see an **Add Variable** button

### What to Do Next
1. Click **Add Variable** button

### What You'll See
- A new row appears with two fields:
  - **Name** field (empty)
  - **Value** field (empty)

### What to Do Next
1. Click in the **Name** field
2. Type: `DATABASE_URL`
3. Click in the **Value** field
4. Paste the connection string you copied earlier

### What You'll See
- The Name field shows: `DATABASE_URL`
- The Value field shows: `postgresql://postgres:abc123xyz@containers-us-west-45.railway.app:6543/railway`

### What to Do Next
1. Click **Save** or **Deploy** button

### What You'll See
- The variable is saved
- Railway automatically redeploys your web service
- You see a notification: "Deployment started"
- The web service shows a loading animation
- After 1-2 minutes, you see "Deployment successful"

---

## STEP 6: Switch to PostgreSQL Server

### What to Do
1. Open your project in your code editor (VS Code, etc.)
2. Look for these files in the root directory:
   - `server.js` (current file)
   - `server-postgres.js` (new file)

### What You'll See
- Both files are listed in your file explorer

### What to Do Next
1. Right-click on `server.js`
2. Select "Rename"
3. Type: `server-json.js`
4. Press Enter

### What You'll See
- `server.js` is renamed to `server-json.js`

### What to Do Next
1. Right-click on `server-postgres.js`
2. Select "Rename"
3. Type: `server.js`
4. Press Enter

### What You'll See
- `server-postgres.js` is renamed to `server.js`
- Now you have:
  - `server.js` (PostgreSQL version)
  - `server-json.js` (backup)

### What to Do Next
1. Open terminal in your project
2. Run these commands:
   ```bash
   git add .
   git commit -m "Migrate to PostgreSQL database"
   git push
   ```

### What You'll See
- Terminal shows:
  ```
  [main abc1234] Migrate to PostgreSQL database
   2 files changed, 0 insertions(+), 0 deletions(-)
   rename server.js => server-json.js (100%)
   rename server-postgres.js => server.js (100%)
  ```
- Changes are pushed to GitHub
- Railway automatically detects the changes
- Railway automatically redeploys your app

---

## STEP 7: Verify Deployment

### What to Do
1. Go back to Railway
2. Click on the **web** service
3. Click the **Logs** tab

### What You'll See
- Deployment logs appear
- You should see messages like:
  ```
  [INFO] Initializing PostgreSQL database...
  [INFO] ✓ Users table ready
  [INFO] ✓ Expenses table ready
  [INFO] ✓ Budgets table ready
  [INFO] ✓ Database initialization complete
  ```
- After a few seconds: "Deployment successful"

### What This Means
- ✅ PostgreSQL is connected
- ✅ Database tables are created
- ✅ Your app is ready to use

---

## STEP 8: Test Your App

### What to Do
1. Go to https://expense-tracker-rho-brown.vercel.app
2. Try to login with: `test@example.com` / `test123456`

### What You'll See
- Login page loads
- You enter credentials
- You click "Login"
- Dashboard appears with your expenses

### What to Do Next
1. Click "Add Expense"
2. Fill in the form:
   - Description: "Test Expense"
   - Amount: "100"
   - Category: "Food"
   - Date: Today's date
3. Click "Add"

### What You'll See
- Expense appears in the table
- You see it in the list

### What to Do Next
1. Refresh the page (F5 or Ctrl+R)

### What You'll See
- Page refreshes
- Expense is STILL there
- ✅ This confirms PostgreSQL is working!

### What to Do Next
1. Go back to Railway
2. Click on **web** service
3. Click the **...** menu (three dots)
4. Click **Redeploy**

### What You'll See
- Deployment starts
- Logs show the app restarting
- After 1-2 minutes: "Deployment successful"

### What to Do Next
1. Go back to your app
2. Refresh the page

### What You'll See
- Page refreshes
- Expense is STILL there
- ✅ This confirms data persists across redeploys!

---

## Success! 🎉

If you see:
- ✅ App loads without errors
- ✅ Login works
- ✅ Expenses are added
- ✅ Expenses persist after refresh
- ✅ Expenses persist after redeploy

**Your PostgreSQL migration is complete!**

---

## If Something Goes Wrong

### Error: "Connection refused"
- Check that DATABASE_URL is set on web service
- Verify the connection string is correct
- Make sure PostgreSQL service is running (green status)

### Error: "Route not found"
- Check Railway logs for errors
- Verify `server.js` is the PostgreSQL version
- Make sure the app redeployed successfully

### Error: "relation 'users' does not exist"
- Check Railway logs
- The tables should be created automatically
- If not, the migration script may have failed

### App Won't Start
- Check Railway logs for error messages
- Verify DATABASE_URL is set
- Verify `pg` dependency is in package.json

---

## Need Help?

1. Check the troubleshooting section above
2. Read the detailed guide: `POSTGRESQL-MIGRATION.md`
3. Check Railway logs for error messages
4. Verify all environment variables are set correctly

**You've got this! 🚀**

