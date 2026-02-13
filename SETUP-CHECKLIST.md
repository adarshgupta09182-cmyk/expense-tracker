# ✅ Setup Checklist - Expense Tracker

Use this checklist to ensure everything is set up correctly.

## Pre-Setup

- [ ] Node.js installed (v14+)
- [ ] npm installed (v6+)
- [ ] Project files downloaded/cloned
- [ ] Terminal/Command Prompt ready

## Installation

- [ ] Run `npm install` in root directory
- [ ] Run `npm install --prefix client` for frontend
- [ ] All dependencies installed without errors
- [ ] No warnings about missing packages

## Configuration

- [ ] `.env` file exists in root directory
- [ ] `.env` contains all required variables:
  - [ ] PORT=3000
  - [ ] NODE_ENV=development
  - [ ] JWT_SECRET (set to a value)
  - [ ] JWT_EXPIRE=7d
  - [ ] CORS_ORIGIN=http://localhost:5173
- [ ] `client/vite.config.js` has proxy configured
- [ ] Proxy points to `http://localhost:3000`

## Backend Setup

- [ ] `server.js` exists in root directory
- [ ] `server.js` has no syntax errors
- [ ] All required npm packages installed:
  - [ ] express
  - [ ] cors
  - [ ] helmet
  - [ ] express-rate-limit
  - [ ] express-validator
  - [ ] jsonwebtoken
  - [ ] bcryptjs
  - [ ] dotenv

## Frontend Setup

- [ ] `client/` directory exists
- [ ] `client/package.json` exists
- [ ] All frontend dependencies installed:
  - [ ] react
  - [ ] react-dom
  - [ ] react-router-dom
  - [ ] axios
  - [ ] chart.js
  - [ ] react-chartjs-2
  - [ ] vite
- [ ] `client/src/` directory structure intact:
  - [ ] `pages/` folder with Login, Register, Dashboard
  - [ ] `components/` folder with all components
  - [ ] `context/` folder with AuthContext
  - [ ] `utils/` folder with axios config

## Starting the Application

### Backend
- [ ] Open Terminal 1
- [ ] Navigate to project root
- [ ] Run `npm start`
- [ ] See message: "Expense Tracker running at http://localhost:3000"
- [ ] See message: "Mode: JSON File Storage (Legacy)"
- [ ] No errors in terminal

### Frontend
- [ ] Open Terminal 2
- [ ] Navigate to project root
- [ ] Run `npm run dev --prefix client`
- [ ] See message: "Local: http://localhost:5173/"
- [ ] No errors in terminal

## Browser Access

- [ ] Open browser
- [ ] Go to `http://localhost:5173`
- [ ] See login page
- [ ] Page loads without errors
- [ ] No console errors (F12)

## First Time Setup

### Create Account
- [ ] Click "Register" button
- [ ] Fill in form:
  - [ ] Name: Test User
  - [ ] Email: test@example.com
  - [ ] Password: password123
- [ ] Click "Register"
- [ ] See success message
- [ ] Redirected to login page

### Login
- [ ] Enter email: test@example.com
- [ ] Enter password: password123
- [ ] Click "Login"
- [ ] See dashboard page
- [ ] No errors

## Dashboard Features

### Expense Management
- [ ] See "Add Expense" form
- [ ] Fill in expense:
  - [ ] Description: Lunch
  - [ ] Amount: 500
  - [ ] Category: Food
  - [ ] Date: Today
- [ ] Click "Add Expense"
- [ ] See expense in table
- [ ] Can edit expense
- [ ] Can delete expense

### Budget Feature
- [ ] See "Budget Settings" button (gear icon)
- [ ] Click to open modal
- [ ] Set Monthly Budget: 10000
- [ ] Set Warning Threshold: 80
- [ ] Click "Save Budget"
- [ ] See budget card on dashboard
- [ ] Budget card shows progress bar
- [ ] Progress bar is green (under budget)

### Filters
- [ ] See filter bar
- [ ] Filter by category
- [ ] Filter by date range
- [ ] Search by description
- [ ] Clear filters button works

### Charts
- [ ] See bar chart (expenses by category)
- [ ] See pie chart (category distribution)
- [ ] Charts update when expenses change

### Export
- [ ] See "Export" button
- [ ] Click to see dropdown
- [ ] Options available:
  - [ ] Expenses Only
  - [ ] Expenses with Budget Summary
  - [ ] Monthly Summary
- [ ] Click each option
- [ ] CSV file downloads
- [ ] File opens correctly

### Summary Cards
- [ ] See total expenses
- [ ] See average expense
- [ ] See expense count
- [ ] Numbers update when expenses change

## Data Files

- [ ] `users.json` created in root directory
- [ ] `expenses.json` created in root directory
- [ ] Both files contain valid JSON
- [ ] Data persists after page refresh
- [ ] Data persists after server restart

## Advanced Features

### Pagination
- [ ] Add multiple expenses (10+)
- [ ] See pagination controls
- [ ] Can navigate between pages
- [ ] Correct number of items per page

### Form Validation
- [ ] Try to submit empty form
- [ ] See validation errors
- [ ] Try invalid email
- [ ] See email validation error
- [ ] Try short password
- [ ] See password validation error

### Error Handling
- [ ] Try to delete expense
- [ ] See confirmation dialog
- [ ] Confirm deletion
- [ ] Expense deleted
- [ ] See success message

### Authentication
- [ ] Logout from dashboard
- [ ] Redirected to login page
- [ ] Cannot access dashboard without login
- [ ] Token stored in localStorage

## Security Checks

- [ ] JWT token in localStorage
- [ ] Token sent with API requests
- [ ] Invalid token rejected
- [ ] Rate limiting active (100 req/15min)
- [ ] CORS headers present
- [ ] Security headers present (Helmet)

## Performance Checks

- [ ] Dashboard loads quickly
- [ ] Charts render smoothly
- [ ] Filters respond immediately
- [ ] Export completes quickly
- [ ] No memory leaks (check DevTools)

## Troubleshooting Verification

### If Backend Won't Start
- [ ] Check if port 3000 is in use
- [ ] Check .env file for errors
- [ ] Check for missing dependencies
- [ ] Check Node.js version (v14+)

### If Frontend Won't Start
- [ ] Check if port 5173 is in use
- [ ] Check if backend is running
- [ ] Check for missing dependencies
- [ ] Check vite.config.js proxy

### If Login Fails
- [ ] Check if users.json exists
- [ ] Check if user was created
- [ ] Check browser console for errors
- [ ] Check server logs for errors

### If Budget Not Showing
- [ ] Check if budget was set
- [ ] Refresh page
- [ ] Check browser console
- [ ] Check server logs

## Documentation Review

- [ ] Read `START-HERE.md`
- [ ] Read `QUICK-START-GUIDE.md`
- [ ] Read `API-DOCUMENTATION.md`
- [ ] Read `SECURITY.md`
- [ ] Read `BUDGET-FEATURE.md`
- [ ] Read `CURRENT-STATUS.md`

## Final Verification

- [ ] All features working
- [ ] No console errors
- [ ] No server errors
- [ ] Data persisting correctly
- [ ] Application responsive
- [ ] All buttons clickable
- [ ] Forms submitting correctly
- [ ] Charts displaying correctly
- [ ] Export working correctly
- [ ] Budget tracking working

## Ready to Use

- [ ] All checklist items completed
- [ ] Application fully functional
- [ ] Ready for production use
- [ ] Ready to customize

## Next Steps

1. [ ] Customize application (colors, text, etc.)
2. [ ] Add more test data
3. [ ] Test all features thoroughly
4. [ ] Set up backup strategy
5. [ ] Plan deployment
6. [ ] Deploy to production

---

**Checklist Status**: Ready to use when all items are checked ✅

**Need Help?**
- Check `START-HERE.md` for quick setup
- Check `QUICK-START-GUIDE.md` for detailed guide
- Check `CURRENT-STATUS.md` for feature overview
- Check browser console (F12) for errors
- Check terminal for server errors
