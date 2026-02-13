# PostgreSQL Migration Guide

## Step 1: Set Up PostgreSQL on Railway

### 1.1 Add PostgreSQL to Your Railway Project

1. Go to https://railway.app
2. Select your project
3. Click **+ New** button
4. Select **Database** → **PostgreSQL**
5. Railway will automatically create a PostgreSQL instance
6. Copy the connection string (you'll need it later)

### 1.2 Get Connection Details

In Railway, go to your PostgreSQL service:
- Click **Connect** tab
- Copy the **Database URL** (looks like: `postgresql://user:password@host:port/database`)

## Step 2: Install Dependencies

Run this command in your project root:

```bash
npm install pg dotenv
```

This installs:
- `pg` - PostgreSQL client for Node.js
- `dotenv` - Environment variable management

## Step 3: Update Environment Variables

### Local Development (.env)

Add to your `.env` file:

```
DATABASE_URL=postgresql://user:password@localhost:5432/expense_tracker
```

### Railway Production

1. Go to your Railway project
2. Select the **web** service (your Node.js app)
3. Go to **Variables** tab
4. Add new variable:
   - **Name:** `DATABASE_URL`
   - **Value:** (paste the PostgreSQL connection string from Railway)

## Step 4: Create Database Schema

The migration script will automatically create tables on first run. The schema includes:

**users table:**
- id (UUID, primary key)
- name (text)
- email (text, unique)
- password (text, hashed)
- role (text)
- created_at (timestamp)

**expenses table:**
- id (UUID, primary key)
- user_id (UUID, foreign key)
- description (text)
- amount (decimal)
- category (text)
- date (date)
- created_at (timestamp)

**budgets table:**
- id (UUID, primary key)
- user_id (UUID, foreign key)
- monthly_budget (decimal)
- warning_threshold (integer)
- created_at (timestamp)
- updated_at (timestamp)

## Step 5: Migrate Data from JSON to PostgreSQL

### Option A: Automatic Migration (Recommended)

The new `server-postgres.js` includes automatic migration:

1. It reads `users.json` and `expenses.json`
2. Imports data into PostgreSQL
3. Backs up JSON files
4. Continues with PostgreSQL for all future operations

### Option B: Manual Migration

If you want to migrate manually:

```bash
# 1. Export data from JSON
node scripts/export-to-postgres.js

# 2. Verify data in PostgreSQL
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM expenses;"
```

## Step 6: Switch to PostgreSQL Server

### Local Testing

```bash
# Test with PostgreSQL locally
node server-postgres.js
```

### Production Deployment

1. Rename `server.js` to `server-json.js` (backup)
2. Rename `server-postgres.js` to `server.js`
3. Commit and push to GitHub
4. Railway will automatically redeploy

## Step 7: Verify Migration

After deployment:

1. Go to your deployed app: https://expense-tracker-rho-brown.vercel.app
2. Login with test user (test@example.com / test123456)
3. Add a new expense
4. Refresh the page - expense should still be there
5. Redeploy the app - expense should persist

## Rollback Plan

If something goes wrong:

1. Keep `server-json.js` as backup
2. Switch back: `mv server.js server-postgres.js && mv server-json.js server.js`
3. Push to GitHub
4. Railway will redeploy with JSON storage

## Troubleshooting

### Connection Error: "connect ECONNREFUSED"

- Check DATABASE_URL is correct
- Verify PostgreSQL service is running on Railway
- Test connection: `psql $DATABASE_URL -c "SELECT 1;"`

### Migration Failed

- Check logs: `railway logs`
- Verify JSON files exist and are valid
- Try manual migration with export script

### Data Not Persisting

- Verify DATABASE_URL is set on Railway
- Check PostgreSQL service is running
- Verify tables were created: `psql $DATABASE_URL -c "\dt"`

## Performance Notes

PostgreSQL is much faster than JSON files:
- ✅ Queries are indexed
- ✅ No file I/O overhead
- ✅ Concurrent access support
- ✅ Built-in backup/recovery

## Next Steps

1. Complete steps 1-3 above
2. Deploy the new `server-postgres.js`
3. Monitor logs for any errors
4. Test adding/editing/deleting expenses
5. Verify data persists after redeploy

## Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Verify DATABASE_URL: `echo $DATABASE_URL`
3. Test PostgreSQL connection: `psql $DATABASE_URL -c "SELECT 1;"`
4. Check server logs for SQL errors
