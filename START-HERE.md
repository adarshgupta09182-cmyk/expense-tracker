# 🚀 START HERE - Expense Tracker Setup

Welcome! This guide will get you up and running in 5 minutes.

## What You Have

A complete expense tracking application with:
- ✅ Backend API (Node.js/Express)
- ✅ Frontend UI (React/Vite)
- ✅ Budget tracking
- ✅ Data export (CSV)
- ✅ Charts & analytics
- ✅ User authentication
- ✅ No database setup needed (uses JSON files)

## Quick Setup (5 minutes)

### Step 1: Install Dependencies
Open terminal in the project root and run:
```bash
npm install
npm install --prefix client
```

### Step 2: Start Backend
Open a terminal and run:
```bash
npm start
```

You should see:
```
Expense Tracker running at http://localhost:3000
Mode: JSON File Storage (Legacy)
```

### Step 3: Start Frontend
Open another terminal and run:
```bash
npm run dev --prefix client
```

You should see:
```
VITE v5.0.8  ready in 123 ms

➜  Local:   http://localhost:5173/
```

### Step 4: Open in Browser
Go to: **http://localhost:5173**

You should see the login page.

## First Time Use

### Create Account
1. Click "Register"
2. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Register"

### Add an Expense
1. Log in with your credentials
2. Fill the expense form:
   - Description: `Lunch`
   - Amount: `500`
   - Category: `Food`
3. Click "Add Expense"

### Set a Budget
1. Click the gear icon (Budget Settings)
2. Set Monthly Budget: `10000`
3. Click "Save Budget"

### Export Data
1. Click "Export" button
2. Choose an option:
   - Expenses Only
   - Expenses with Budget Summary
   - Monthly Summary

## What's Working

| Feature | Status |
|---------|--------|
| User Registration | ✅ |
| User Login | ✅ |
| Add Expenses | ✅ |
| Edit Expenses | ✅ |
| Delete Expenses | ✅ |
| Filter Expenses | ✅ |
| Budget Tracking | ✅ |
| Charts & Analytics | ✅ |
| CSV Export | ✅ |
| Forgot Password | ✅ |
| Admin Dashboard | ✅ |

## Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is in use
# If yes, change PORT in .env file
PORT=3001
```

### Frontend won't start
```bash
# Make sure backend is running first
# Then try:
npm run dev --prefix client
```

### Login not working
1. Check if `users.json` exists in root directory
2. Try creating a new account
3. Check browser console (F12) for errors

### Budget not showing
1. Make sure you set a budget first
2. Refresh the page
3. Check browser console for errors

## File Structure

```
expense-tracker/
├── server.js              ← Backend (run with: npm start)
├── client/                ← Frontend (run with: npm run dev --prefix client)
│   └── src/
│       ├── pages/         ← Login, Register, Dashboard
│       ├── components/    ← UI components
│       └── utils/         ← API configuration
├── users.json             ← User data (auto-created)
├── expenses.json          ← Expense data (auto-created)
└── .env                   ← Configuration
```

## Data Storage

All data is stored in JSON files:
- `users.json` - User accounts and budgets
- `expenses.json` - All expenses

These files are created automatically on first run.

## Environment Variables

The `.env` file is already configured:
```
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production-use-long-random-string
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

## Available Commands

### Backend
```bash
npm start              # Run server
npm dev               # Run with auto-reload
npm start:mongodb     # Run with MongoDB (requires MongoDB)
npm dev:mongodb       # MongoDB with auto-reload
```

### Frontend
```bash
npm run dev --prefix client      # Start dev server
npm run build --prefix client    # Build for production
npm run preview --prefix client  # Preview production build
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Start backend
3. ✅ Start frontend
4. ✅ Create test account
5. ✅ Add some expenses
6. ✅ Set a budget
7. ✅ Export data

## Need Help?

- **Setup Issues**: Check `QUICK-START-GUIDE.md`
- **API Details**: Check `API-DOCUMENTATION.md`
- **Security**: Check `SECURITY.md`
- **Budget Feature**: Check `BUDGET-FEATURE.md`
- **Current Status**: Check `CURRENT-STATUS.md`

## Key Features

### 💰 Expense Management
- Add, edit, delete expenses
- Categorize (Food, Transport, Entertainment, Bills, Other)
- Filter by date and category
- Search by description

### 📊 Budget Tracking
- Set monthly budget
- Visual progress bar
- Warning at 80% (customizable)
- 12-month history

### 📈 Analytics
- Bar chart by category
- Pie chart distribution
- Monthly summaries
- Total/average calculations

### 📥 Data Export
- CSV format
- 3 export options
- Includes budget summary
- Monthly summaries

### 🔐 Security
- JWT authentication
- Password hashing
- Input validation
- Rate limiting
- CORS protection

## Tips

- Use `npm dev` for development (auto-reload)
- Check browser console (F12) for frontend errors
- Check terminal for backend errors
- Data persists between restarts
- Budget threshold is customizable
- All amounts in Indian Rupees (₹)

## Support

If something doesn't work:
1. Check the troubleshooting section above
2. Look at browser console (F12)
3. Check terminal output
4. Review the documentation files
5. Verify all dependencies are installed

---

**Ready?** Start with Step 1 above! 🎉

For detailed information, see `QUICK-START-GUIDE.md`
