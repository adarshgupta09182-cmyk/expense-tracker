# Delete User from Database

## Option 1: Using Railway Database Console (Recommended)

### Step 1: Go to Railway
1. Open: https://railway.app
2. Login
3. Open your project
4. Click on **PostgreSQL** service (not the backend)

### Step 2: Go to Data Tab
1. Click **"Data"** tab
2. You'll see a database browser

### Step 3: Run SQL Query
1. Click **"Query"** or **"SQL"** option
2. Paste this SQL command:

```sql
DELETE FROM users WHERE email = 'adarshgupta09182@gmail.com';
```

3. Click **"Execute"** or **"Run"**
4. You should see: `DELETE 1` (meaning 1 user was deleted)

---

## Option 2: Using psql Command Line

If you have PostgreSQL installed locally:

```bash
psql "your-database-connection-string" -c "DELETE FROM users WHERE email = 'adarshgupta09182@gmail.com';"
```

---

## Option 3: Using Railway CLI

```bash
railway connect postgres
```

Then run:
```sql
DELETE FROM users WHERE email = 'adarshgupta09182@gmail.com';
```

---

## Verify Deletion

After running the delete command, verify it worked:

```sql
SELECT * FROM users WHERE email = 'adarshgupta09182@gmail.com';
```

Should return: **0 rows** (user is deleted)

---

## ✅ After Deletion

You can now register `adarshgupta09182@gmail.com` again on your website!

---

## 🆘 If You Need Help

Let me know which option you choose and I can help you execute it.
