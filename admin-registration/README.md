# Admin Dashboard - Expense Tracker

A complete admin management portal for the Expense Tracker application. Admins can manage users, view expenses, and access dashboard statistics.

## Features

✅ **Admin Registration** - Register the first admin with admin secret key
✅ **Admin Login** - Secure login with JWT authentication
✅ **User Management** - View all users with statistics
✅ **Expense Management** - View and delete all expenses
✅ **Dashboard Statistics** - Real-time analytics and insights
✅ **Search Functionality** - Search users by name or email
✅ **Responsive Design** - Works on desktop, tablet, and mobile

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Set the `ADMIN_SECRET` environment variable on your backend (Railway):

```
ADMIN_SECRET=your-secret-key-here
```

### 3. Configure API URL

The admin portal will use the API URL from localStorage or default to `http://localhost:3000`.

To set a custom API URL, add this to your browser console:
```javascript
localStorage.setItem('apiUrl', 'https://your-backend-url.com');
```

### 4. Start the Admin Portal

```bash
npm start
```

The admin portal will run on `http://localhost:5000`

## Usage

### First Time Setup

1. Navigate to `http://localhost:5000`
2. Click "Register here" to go to registration page
3. Fill in admin details:
   - Full Name
   - Email
   - Password
   - Admin Secret Key (provided by system administrator)
4. Click "Register as Admin"
5. You'll be redirected to login page
6. Login with your credentials

### Admin Dashboard

Once logged in, you can:

#### Users Tab
- View all users with their statistics
- See total expenses and amount spent per user
- Click on a user card to view detailed information
- Delete users (this also deletes all their expenses)

#### Expenses Tab
- View all expenses from all users
- See expense details: description, category, amount, date
- Delete individual expenses
- Filter by user

#### Statistics Tab
- Total number of users
- Total number of expenses
- Total amount spent across all users
- Average expense amount
- Number of admins

### Search Users

Use the search box in the header to filter users by name or email in real-time.

## API Endpoints Used

### Admin Authentication
- `POST /api/admin/register` - Register first admin
- `POST /api/admin/login` - Admin login

### Admin Operations
- `GET /api/admin/users` - Get all users with statistics
- `GET /api/admin/users/:userId` - Get user details and expenses
- `DELETE /api/admin/users/:userId` - Delete user and their expenses
- `DELETE /api/admin/expenses/:expenseId` - Delete specific expense
- `GET /api/admin/stats` - Get dashboard statistics

## Deployment

### Deploy to Netlify

1. Build the admin portal (it's already static HTML/CSS/JS)
2. Deploy the `admin-registration` folder to Netlify
3. Set environment variables in Netlify if needed
4. Update the API URL in the deployed version:
   ```javascript
   localStorage.setItem('apiUrl', 'https://your-backend-url.com');
   ```

### Deploy to Railway (as separate service)

1. Create a new Railway project
2. Connect your GitHub repository
3. Set the root directory to `admin-registration`
4. Deploy

## Security Notes

⚠️ **Admin Secret**: Keep your admin secret key secure. Only share it with authorized administrators.

⚠️ **JWT Token**: The admin token is stored in localStorage. Clear it when logging out.

⚠️ **CORS**: Ensure your backend CORS settings allow requests from the admin portal URL.

## Troubleshooting

### "Cannot connect to server"
- Ensure the backend is running
- Check that the API URL is correct
- Verify CORS settings on the backend

### "Invalid admin secret"
- Verify the admin secret matches the `ADMIN_SECRET` environment variable on the backend
- Ensure the environment variable is set on Railway

### "Unauthorized" error
- Your session may have expired
- Login again to get a new token
- Clear localStorage and try again

### Users not loading
- Check browser console for errors
- Verify the admin token is valid
- Ensure the backend is running and accessible

## File Structure

```
admin-registration/
├── index.html          # Admin registration page
├── login.html          # Admin login page
├── dashboard.html      # Admin dashboard
├── register.js         # Registration logic
├── login.js            # Login logic
├── dashboard.js        # Dashboard logic
├── style.css           # Auth pages styling
├── dashboard.css       # Dashboard styling
├── server.js           # Express server for local development
├── package.json        # Dependencies
└── README.md           # This file
```

## Development

### Local Development

```bash
# Terminal 1: Start backend
cd ..
npm start

# Terminal 2: Start admin portal
cd admin-registration
npm start
```

Then open `http://localhost:5000` in your browser.

### Production

For production, deploy:
- Backend to Railway
- Admin portal to Netlify or Railway

Update the API URL in the deployed admin portal to point to your production backend.

## Support

For issues or questions, please refer to the main project documentation or contact the development team.
