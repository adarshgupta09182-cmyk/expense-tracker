# Admin Dashboard Setup Guide

## Overview

The admin dashboard is a separate web application that allows administrators to manage users and expenses in the Expense Tracker system.

## Quick Start

### Local Development

1. **Start the backend server** (if not already running):
   ```bash
   npm start
   ```
   Backend will run on `http://localhost:3000`

2. **Start the admin portal**:
   ```bash
   cd admin-registration
   npm start
   ```
   Admin portal will run on `http://localhost:5000`

3. **Open in browser**:
   Navigate to `http://localhost:5000`

### First Admin Registration

1. Click "Register here" on the login page
2. Fill in the registration form:
   - **Full Name**: Your name
   - **Email**: Your email address
   - **Password**: A secure password (min 6 characters)
   - **Admin Secret**: The admin secret key (ask your system administrator)
3. Click "Register as Admin"
4. You'll be redirected to login page
5. Login with your credentials

### Admin Dashboard Features

#### 👥 Users Tab
- View all registered users
- See user statistics:
  - Number of expenses
  - Total amount spent
  - Monthly budget
- Click on a user to view detailed information
- Delete users (removes user and all their expenses)

#### 💰 Expenses Tab
- View all expenses from all users
- See expense details:
  - Description
  - Category
  - Amount
  - Date
  - User who created it
- Delete individual expenses

#### 📊 Statistics Tab
- Total number of users
- Total number of expenses
- Total amount spent
- Average expense amount
- Number of admins

### Search Users

Use the search box in the header to quickly find users by name or email.

## Production Deployment

### Backend Setup (Railway)

1. Set the `ADMIN_SECRET` environment variable on Railway:
   ```
   ADMIN_SECRET=your-secure-secret-key
   ```

2. Ensure `CORS_ORIGIN` is set to your admin portal URL:
   ```
   CORS_ORIGIN=https://your-admin-portal-url.com
   ```

### Admin Portal Deployment (Netlify)

1. Deploy the `admin-registration` folder to Netlify
2. After deployment, set the API URL in your browser:
   ```javascript
   localStorage.setItem('apiUrl', 'https://your-backend-url.com');
   ```

Or add this to the dashboard.html before the script tag:
```html
<script>
  if (!localStorage.getItem('apiUrl')) {
    localStorage.setItem('apiUrl', 'https://your-backend-url.com');
  }
</script>
```

## File Structure

```
admin-registration/
├── index.html          # Registration page
├── login.html          # Login page
├── dashboard.html      # Main dashboard
├── register.js         # Registration logic
├── login.js            # Login logic
├── dashboard.js        # Dashboard logic
├── style.css           # Auth styling
├── dashboard.css       # Dashboard styling
├── server.js           # Local dev server
├── package.json        # Dependencies
└── README.md           # Detailed documentation
```

## API Endpoints

The admin dashboard uses these backend endpoints:

### Authentication
- `POST /api/admin/register` - Register first admin
- `POST /api/admin/login` - Admin login

### User Management
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:userId` - Get user details
- `DELETE /api/admin/users/:userId` - Delete user

### Expense Management
- `DELETE /api/admin/expenses/:expenseId` - Delete expense

### Statistics
- `GET /api/admin/stats` - Get dashboard stats

## Security

⚠️ **Important Security Notes:**

1. **Admin Secret**: Keep the admin secret key secure
2. **JWT Token**: Stored in localStorage, cleared on logout
3. **CORS**: Configure CORS properly on backend
4. **HTTPS**: Always use HTTPS in production
5. **Password**: Use strong passwords for admin accounts

## Troubleshooting

### "Cannot connect to server"
- Check if backend is running
- Verify API URL is correct
- Check CORS settings

### "Invalid admin secret"
- Verify the secret matches backend environment variable
- Ensure ADMIN_SECRET is set on Railway

### "Unauthorized" error
- Session may have expired
- Login again to get new token

### Users/Expenses not loading
- Check browser console for errors
- Verify admin token is valid
- Ensure backend is accessible

## Next Steps

1. Register your first admin account
2. Login to the dashboard
3. Start managing users and expenses
4. Monitor statistics and analytics

## Support

For detailed information, see:
- `admin-registration/README.md` - Detailed admin portal documentation
- `API-DOCUMENTATION.md` - Complete API reference
- `AUTH-AUDIT-REPORT.md` - Authentication system details

## Environment Variables

### Backend (Railway)

```
ADMIN_SECRET=your-secret-key
CORS_ORIGIN=https://your-admin-portal-url.com
```

### Admin Portal (Netlify)

Set via localStorage or environment:
```javascript
localStorage.setItem('apiUrl', 'https://your-backend-url.com');
```

## Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] ADMIN_SECRET set on Railway
- [ ] CORS_ORIGIN configured on Railway
- [ ] Admin portal deployed to Netlify
- [ ] API URL configured in admin portal
- [ ] First admin account created
- [ ] Test user management
- [ ] Test expense management
- [ ] Test statistics
- [ ] Verify search functionality
