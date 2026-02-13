# Test Credentials

## Login with Test User

**Email:** `test@example.com`
**Password:** `password123`

This test user is available on both local and deployed versions.

## How to Add More Test Users

If you want to add more test users to `users.json`, you need to:

1. Generate a bcrypt hash for the password:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('yourpassword', 10, (err, hash) => { console.log(hash); })"
```

2. Add the user to `users.json`:
```json
{
  "id": "user_2",
  "name": "Your Name",
  "email": "your@email.com",
  "password": "PASTE_THE_HASH_HERE",
  "role": "user",
  "createdAt": "2025-02-13T00:00:00Z"
}
```

3. Commit and push to GitHub

## Deployment URLs

- **Frontend:** https://expense-tracker-rho-brown.vercel.app
- **Backend:** https://web-production-43d51.up.railway.app

## Important Notes

- The `users.json` file is tracked in Git (not in .gitignore)
- All user data persists across deployments
- Passwords are hashed with bcrypt for security
- Each user has a unique ID and role
