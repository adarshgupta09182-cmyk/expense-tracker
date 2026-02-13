# Expense Tracker - Access Links

## Make sure the server is running!
Run: `npm start` or double-click `start.bat`

## Available Pages

### Main Pages
- **Login**: http://localhost:3000/login.html
- **User Dashboard**: http://localhost:3000/index.html (after login as user)
- **Admin Dashboard**: http://localhost:3000/admin.html (after login as admin)

### Registration Pages
- **User Registration**: http://localhost:3000/user-register.html
- **Admin Registration**: http://localhost:3000/admin-register.html

### Password Reset
- **Forgot Password**: http://localhost:3000/forgot-password.html

## Quick Start

1. Start the server:
   ```
   npm start
   ```
   Or double-click: `start.bat`

2. Register a new account:
   - For regular user: http://localhost:3000/user-register.html
   - For admin: http://localhost:3000/admin-register.html

3. Login at: http://localhost:3000/login.html

4. If you forget password: http://localhost:3000/forgot-password.html

## Troubleshooting

**Links not working?**
- Make sure the server is running (check terminal for "Expense Tracker running at http://localhost:3000")
- Restart the server: Close terminal and run `npm start` again
- Or use: `force-restart.bat`

**Can't access pages?**
- Check if port 3000 is free
- Try: http://127.0.0.1:3000/login.html instead

**Registration errors?**
- Make sure users.json and expenses.json exist in the root folder
- They should contain: []
