# Admin Dashboard - Quick Reference

## URLs

| Component | Local | Production |
|-----------|-------|------------|
| Main App | http://localhost:3000 | https://sensational-croissant-62fb1f.netlify.app |
| Backend API | http://localhost:3000 | https://web-production-43d51.up.railway.app |
| Admin Portal | http://localhost:5000 | https://your-admin-portal.netlify.app |

## Quick Start

### Local Development
```bash
# Terminal 1: Backend
npm start

# Terminal 2: Admin Portal
cd admin-registration
npm start
```

### Production
- Backend: Already deployed to Railway
- Admin Portal: Deploy to Netlify

## Admin Portal Pages

| Page | URL | Purpose |
|------|-----|---------|
| Registration | `/index.html` | Register first admin |
| Login | `/login.html` | Admin login |
| Dashboard | `/dashboard.html` | Main admin interface |

## Dashboard Tabs

### 👥 Users Tab
- View all users
- See user statistics
- Search users
- View user details
- Delete users

### 💰 Expenses Tab
- View all expenses
- See expense details
- Delete expenses
- Filter by user

### 📊 Statistics Tab
- Total users
- Total expenses
- Total amount spent
- Average expense
- Admin count

## API Endpoints

### Authentication
```
POST /api/admin/register
POST /api/admin/login
```

### Users
```
GET /api/admin/users
GET /api/admin/users/:userId
DELETE /api/admin/users/:userId
```

### Expenses
```
DELETE /api/admin/expenses/:expenseId
```

### Statistics
```
GET /api/admin/stats
```

## Environment Variables

### Backend (Railway)
```
ADMIN_SECRET=your-secret-key
CORS_ORIGIN=https://your-admin-portal.netlify.app
```

### Admin Portal (localStorage)
```javascript
localStorage.setItem('apiUrl', 'https://your-backend-url.com');
```

## File Structure

```
admin-registration/
├── index.html          # Registration
├── login.html          # Login
├── dashboard.html      # Dashboard
├── register.js         # Registration logic
├── login.js            # Login logic
├── dashboard.js        # Dashboard logic
├── style.css           # Auth styling
├── dashboard.css       # Dashboard styling
├── server.js           # Dev server
├── package.json        # Dependencies
└── README.md           # Documentation
```

## Common Tasks

### Register First Admin
1. Go to admin portal
2. Click "Register here"
3. Fill form with admin secret
4. Click "Register as Admin"

### Login
1. Go to login page
2. Enter email and password
3. Click "Login"

### View Users
1. Click "Users" tab
2. See all users with stats
3. Click user card for details

### Delete User
1. Click user card
2. Click "Delete User" button
3. Confirm deletion

### Search Users
1. Type in search box
2. Results filter in real-time

### View Expenses
1. Click "Expenses" tab
2. See all expenses
3. Click "Delete" to remove

### View Statistics
1. Click "Statistics" tab
2. See dashboard metrics

### Logout
1. Click "Logout" button
2. Redirected to login page

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't connect to server | Check backend is running, verify API URL |
| Invalid admin secret | Verify ADMIN_SECRET on Railway |
| Unauthorized error | Login again, clear localStorage |
| Users not loading | Check console, verify token, restart |
| CORS error | Update CORS_ORIGIN on Railway |

## Security Checklist

- [ ] ADMIN_SECRET is secure
- [ ] CORS_ORIGIN is correct
- [ ] Using HTTPS in production
- [ ] Strong admin passwords
- [ ] Regular backups
- [ ] Monitor logs

## Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] ADMIN_SECRET set on Railway
- [ ] CORS_ORIGIN configured
- [ ] Admin portal deployed to Netlify
- [ ] API URL configured
- [ ] First admin created
- [ ] All features tested

## Key Features

✅ User management
✅ Expense management
✅ Dashboard statistics
✅ Search functionality
✅ Responsive design
✅ JWT authentication
✅ Admin secret validation
✅ Real-time updates

## Support

- **Documentation**: `admin-registration/README.md`
- **Setup Guide**: `ADMIN-DASHBOARD-SETUP.md`
- **Deployment**: `ADMIN-DEPLOYMENT-GUIDE.md`
- **API Docs**: `API-DOCUMENTATION.md`

## Quick Commands

```bash
# Start backend
npm start

# Start admin portal
cd admin-registration && npm start

# Deploy to Netlify
netlify deploy --prod --dir admin-registration

# Clear localStorage
localStorage.clear()

# Set API URL
localStorage.setItem('apiUrl', 'https://your-backend-url.com')

# Check API URL
console.log(localStorage.getItem('apiUrl'))
```

## Response Formats

### Get Users
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 123,
      "name": "John",
      "email": "john@example.com",
      "role": "user",
      "expenseCount": 10,
      "totalSpent": "5000.00",
      "monthlyBudget": 10000
    }
  ]
}
```

### Get User Details
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "John",
    "email": "john@example.com",
    "role": "user",
    "monthlyBudget": 10000,
    "expenses": [
      {
        "id": 1,
        "description": "Groceries",
        "amount": 500,
        "category": "Food",
        "date": "2024-01-15"
      }
    ]
  }
}
```

### Get Statistics
```json
{
  "success": true,
  "data": {
    "totalUsers": 5,
    "totalExpenses": 50,
    "totalAmount": "25000.00",
    "avgExpense": "500.00",
    "adminCount": 1
  }
}
```

## Notes

- Admin portal is static HTML/CSS/JS
- No build process required
- Uses localStorage for token storage
- Responsive design works on all devices
- Real-time search functionality
- Automatic logout on token expiration

---

**Last Updated**: February 2024
**Status**: Production Ready ✅
