# Data Persistence Guide

## Current Limitation: Ephemeral Filesystem

Railway (and most cloud platforms) use an **ephemeral filesystem**, which means:
- Files created during runtime are **lost on redeploy**
- Only files committed to Git persist across deployments
- This affects `expenses.json` which stores user-added expenses

## Current Solution: Backup/Restore Mechanism

The app now includes a backup/restore system:

1. **On Startup**: The server checks for backup files (`users-backup.json`, `expenses-backup.json`)
2. **On Restore**: If data files are missing, they're restored from backups
3. **On Update**: Every time data is written, backups are automatically updated

### How It Works

```
User adds expense → expenses.json updated → expenses-backup.json updated
                                                        ↓
                                            Committed to Git
                                                        ↓
                                    Persists across deployments
```

## Limitations

⚠️ **Important**: The backup mechanism has a limitation:
- Expenses added during a session are backed up to `expenses-backup.json`
- However, if Railway redeploys **before** the backup is committed to Git, those expenses will be lost
- This typically happens when you deploy code changes

## Recommended Solution: Use a Database

For production use, migrate to a persistent database:

### Option 1: PostgreSQL (Recommended)
```bash
# Railway provides free PostgreSQL
# Update server.js to use PostgreSQL instead of JSON files
```

### Option 2: MongoDB
```bash
# Use MongoDB Atlas (free tier available)
# Update server.js to use MongoDB driver
```

### Option 3: SQLite with Persistent Volume
```bash
# Use Railway's persistent volumes
# Store SQLite database in persistent storage
```

## Current Workaround

Until you migrate to a database:

1. **Add expenses regularly** - They're backed up automatically
2. **Commit backups to Git** - Run `git add expenses-backup.json && git commit && git push`
3. **Redeploy after committing** - This ensures expenses persist

## Testing Data Persistence

To test if your expenses persist:

1. Add an expense on the deployed site
2. Wait a few seconds for backup to be created
3. Manually commit the backup: `git add expenses-backup.json && git commit && git push`
4. Trigger a redeploy on Railway
5. Check if the expense is still there

## Files Involved

- `preserve-data.js` - Backup/restore logic
- `users-backup.json` - Backup of users (committed to Git)
- `expenses-backup.json` - Backup of expenses (committed to Git)
- `users.json` - Runtime users file (ephemeral)
- `expenses.json` - Runtime expenses file (ephemeral)

## Next Steps

1. **Short term**: Use the backup mechanism and manually commit backups
2. **Medium term**: Set up a cron job to auto-commit backups
3. **Long term**: Migrate to PostgreSQL or MongoDB for true persistence
