# Expense Tracker - Quick Start Guide

## Overview
This is a complete expense tracking application with:
- **Backend**: Node.js/Express API with JWT authentication
- **Frontend**: React with Vite
- **Storage**: JSON file-based (no MongoDB required)
- **Features**: Expense management, budget tracking, CSV export, charts

## Prerequisites
- Node.js (v14+)
- npm (v6+)

## Installation & Setup

### 1. Install Backend Dependencies
```bash
npm install
```

### 2. Install Frontend Dependencies
```bash
npm install --prefix client
```

### 3. Configure Environment Variables
The `.env` file is already configured with defaults:
```
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production-use-long-random-string
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

## Running the Application

### Option 1: Run Both Backend & Frontend (Recommended)

**Terminal 1 - Start Backend (JSON Storage)**
```bash
npm start
```
Server runs on `http://localhost:3000`

**Terminal 2 - Start Frontend**
```bash
npm run dev --prefix client
```
Frontend runs on `http://localhost:5173`

### Option 2: Run Individually

**Backend only:**
```bash
npm start              # JSON file storage (default)
npm dev               # JSON file storage with auto-reload
```

**Frontend only:**
```bash
npm run dev --prefix client
```

## First Time Setup

### 1. Create a Test Account
1. Open `http://localhost:5173` in your browser
2. Click "Register" 
3. Create an account with:
   - Name: Test User
   - Email: test@example.com
   - Password: password123

### 2. Add Some Expenses
1. Log in with your credentials
2. Fill in the expense form:
   - Description: "Lunch"
   - Amount: 500
   - Category: Food
   - Date: Today
3. Click "Add Expense"

### 3. Set a Budget
1. Click the "Budget Settings" button (gear icon)
2. Set Monthly Budget: 10000
3. Warning Threshold: 80%
4. Click "Save Budget"

### 4. Export Data
1. Click "Export" button
2. Choose export format:
   - Expenses Only
   - Expenses with Budget Summary
   - Monthly Summary

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/reset-password` - Reset password

### Expenses
- `GET /api/expenses` - Get all user expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary/monthly` - Get monthly summary

### Budget
- `GET /api/budget` - Get current budget status
- `PUT /api/budget` - Set/update budget
- `GET /api/budget/history` - Get 12-month budget history

### Export
- `GET /api/export/expenses` - Export expenses as CSV
- `GET /api/export/expenses-with-budget` - Export with budget summary
- `GET /api/export/monthly-summary` - Export monthly summary

## Data Files

The application creates two JSON files in the root directory:
- `users.json` - Stores user accounts and budget settings
- `expenses.json` - Stores all expenses

These files are created automatically on first run.

## Troubleshooting

### Login Issues
1. Check if `users.json` exists in the root directory
2. Verify the user was created during registration
3. Check browser console for error messages

### Budget Not Showing
1. Ensure you've set a budget in Budget Settings
2. Refresh the page
3. Check browser console for errors

### Export Not Working
1. Ensure you have at least one expense
2. Check that you're logged in
3. Verify the date range filters are correct

### Port Already in Use
If port 3000 is already in use:
```bash
# Change PORT in .env file
PORT=3001
```

## Features

### Expense Management
- Add, edit, delete expenses
- Categorize expenses (Food, Transport, Entertainment, Bills, Other)
- Filter by date range and category
- Search by description

### Budget Tracking
- Set monthly budget
- Configure warning threshold (default 80%)
- Visual progress bar with color coding:
  - Green: Under budget
  - Yellow: Warning (80%+)
  - Red: Over budget

### Analytics
- Bar chart showing expenses by category
- Pie chart showing category distribution
- Monthly summary statistics

### Data Export
- Export expenses as CSV
- Include budget summary in export
- Monthly summary export
- Automatic filename generation

### Security
- JWT token-based authentication
- Password hashing with bcryptjs
- Input validation and sanitization
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet.js security headers

## Development

### Available Scripts

**Backend:**
- `npm start` - Run server (JSON storage)
- `npm dev` - Run with auto-reload
- `npm start:mongodb` - Run with MongoDB (requires MongoDB setup)
- `npm dev:mongodb` - Run MongoDB mode with auto-reload

**Frontend:**
- `npm run dev --prefix client` - Start dev server
- `npm run build --prefix client` - Build for production
- `npm run preview --prefix client` - Preview production build

## Project Structure

```
expense-tracker/
├── server.js                 # Main server file (JSON storage)
├── server-mongodb.js         # MongoDB version
├── package.json              # Backend dependencies
├── .env                       # Environment variables
├── config/                    # Configuration files
├── controllers/               # Business logic
├── middleware/                # Express middleware
├── models/                    # Data models
├── routes/                    # API routes
├── public/                    # Legacy HTML frontend
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React context
│   │   └── utils/            # Utility functions
│   └── package.json          # Frontend dependencies
└── expenses.json             # Data file (auto-created)
```

## Next Steps

1. **Customize**: Update `.env` with your own JWT_SECRET
2. **Deploy**: Follow deployment guides for your hosting platform
3. **Backup**: Regularly backup `users.json` and `expenses.json`
4. **Monitor**: Check logs for any errors

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Check server logs for API errors
4. Verify all dependencies are installed

## License

MIT
