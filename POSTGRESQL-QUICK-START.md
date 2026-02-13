# PostgreSQL Migration - Quick Start (5 Minutes)

## TL;DR - The Fastest Way to Migrate

### 1. Add PostgreSQL to Railway (2 min)
```
Railway.app → expense-tracker project → + New → Database → PostgreSQL
```

### 2. Get Connection String (1 min)
```
PostgreSQL service → Connect tab → Copy "Database URL"
```

### 3. Add to Web Service (1 min)
```
web service → Variables tab → Add Variable
Name: DATABASE_URL
Value: (paste connection string)
```

### 4. Switch Server (1 min)
```bash
# In your project root:
git mv server.js server-json.js
git mv server-postgres.js server.js
git add .
git commit -m "Migrate to PostgreSQL"
git push
```

### 5. Done! ✅
- Railway auto-redeploys
- Your app now uses PostgreSQL
- Data persists forever

---

## Detailed Steps

### Step 1: Add PostgreSQL

1. Go to https://railway.app
2. Click your "expense-tracker" project
3. Click **+ New** button
4. Select **Database** → **PostgreSQL**
5. Wait 30-60 seconds for it to initialize

### Step 2: Get Connection String

1. Click the **PostgreSQL** service
2. Click **Connect** tab
3. Find **Database URL** section
4. Copy the entire string (click copy icon or select manually)

**Example:**
```
postgresql://postgres:abc123xyz@containers-us-west-45.railway.app:6543/railway
```

### Step 3: Add DATABASE_URL

1. Click the **web** service
2. Click **Variables** tab
3. Click **Add Variable**
4. **Name:** `DATABASE_URL`
5. **Value:** (paste the connection string)
6. Click **Save**
7. Wait for redeploy (1-2 minutes)

### Step 4: Switch Server

Open terminal in your project root and run:

```bash
git mv server.js server-json.js
git mv server-postgres.js server.js
git add .
git commit -m "Migrate to PostgreSQL"
git push
```

Railway will automatically redeploy with the new server.

### Step 5: Verify

1. Go to https://expense-tracker-rho-brown.vercel.app
2. Login with: `test@example.com` / `test123456`
3. Add an expense
4. Refresh page - expense should still be there ✅

---

## What Happens Automatically

When you push the changes:

1. Railway detects the new `server.js`
2. Railway redeploys your app
3. `server-postgres.js` starts up
4. It connects to PostgreSQL using DATABASE_URL
5. It creates tables automatically
6. It migrates data from JSON files (if they exist)
7. Your app is now using PostgreSQL

---

## Troubleshooting

### "Connection refused"
- Check DATABASE_URL is set on web service
- Verify connection string is correct
- Make sure PostgreSQL service is running

### "Route not found"
- Check Railway logs
- Verify `server.js` is the PostgreSQL version
- Make sure app redeployed successfully

### "Data not persisting"
- Verify DATABASE_URL is set correctly
- Check PostgreSQL service is running
- Look at Railway logs for SQL errors

---

## Rollback (If Needed)

If something goes wrong:

```bash
git mv server.js server-postgres.js
git mv server-json.js server.js
git add .
git commit -m "Rollback to JSON"
git push
```

Your app will redeploy with JSON storage and all old data will be available.

---

## Success Indicators

✅ You're done when:
- App loads without errors
- Login works
- Expenses persist after refresh
- Expenses persist after redeploy

---

## Next Steps

1. Follow the 5 steps above
2. Test your app
3. Monitor Railway logs for any errors
4. You're done! 🎉

---

## Need More Details?

- **Visual Guide:** `RAILWAY-POSTGRESQL-VISUAL-GUIDE.md`
- **Complete Guide:** `POSTGRESQL-MIGRATION.md`
- **Connection String Help:** `CONNECTION-STRING-QUICK-REFERENCE.md`
- **Checklist:** `POSTGRESQL-MIGRATION-CHECKLIST.md`

