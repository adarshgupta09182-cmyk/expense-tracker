# Quick Reference Card

## 🚀 Start Application

```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend
npm run dev --prefix client

# Open browser
http://localhost:5173
```

## 📝 Test Account

```
Email: test@example.com
Password: password123
```

## 🔧 Common Commands

### Backend
```bash
npm start              # Run server
npm dev               # Run with auto-reload
npm start:mongodb     # Run with MongoDB
npm dev:mongodb       # MongoDB with auto-reload
```

### Frontend
```bash
npm run dev --prefix client      # Start dev server
npm run build --prefix client    # Build for production
npm run preview --prefix client  # Preview build
```

## 📊 API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/reset-password
```

### Expenses
```
GET    /api/expenses
POST   /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
GET    /api/expenses/summary/monthly
```

### Budget
```
GET    /api/budget
PUT    /api/budget
GET    /api/budget/history
```

### Export
```
GET /api/export/expenses
GET /api/export/expenses-with-budget
GET /api/export/monthly-summary
```

## 🗂️ File Locations

| File | Purpose |
|------|---------|
| `server.js` | Backend API |
| `client/src/pages/Dashboard.jsx` | Main dashboard |
| `client/src/components/BudgetCard.jsx` | Budget display |
| `client/src/components/ExportButton.jsx` | Export feature |
| `users.json` | User data |
| `expenses.json` | Expense data |
| `.env` | Configuration |

## 🔐 Environment Variables

```
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Change PORT in .env |
| Port 5173 in use | Vite will use next available |
| Login fails | Check users.json exists |
| Budget not showing | Set budget first, refresh |
| Export not working | Ensure you have expenses |
| CORS error | Check CORS_ORIGIN in .env |

## 📚 Documentation

| File | Purpose |
|------|---------|
| `START-HERE.md` | Quick 5-min setup |
| `QUICK-START-GUIDE.md` | Comprehensive guide |
| `API-DOCUMENTATION.md` | API reference |
| `SECURITY.md` | Security features |
| `BUDGET-FEATURE.md` | Budget details |
| `CURRENT-STATUS.md` | Feature overview |
| `SETUP-CHECKLIST.md` | Setup verification |
| `FINAL-SUMMARY.md` | Complete summary |

## 💾 Data Files

- `users.json` - User accounts & budgets
- `expenses.json` - All expenses
- Both auto-created on first run
- Data persists between restarts

## 🎯 Features

✅ User registration & login
✅ Add/edit/delete expenses
✅ Filter & search expenses
✅ Set monthly budget
✅ Budget tracking & warnings
✅ Charts & analytics
✅ CSV export (3 formats)
✅ Forgot password
✅ Admin dashboard
✅ Form validation
✅ Error handling
✅ JWT authentication
✅ Rate limiting
✅ CORS protection
✅ Security headers

## 🔑 Key Shortcuts

| Action | How |
|--------|-----|
| Add expense | Fill form + click "Add Expense" |
| Edit expense | Click edit icon in table |
| Delete expense | Click delete icon in table |
| Set budget | Click gear icon (Budget Settings) |
| Export data | Click "Export" button |
| View charts | Scroll down on dashboard |
| Filter expenses | Use filter bar |
| Search expenses | Type in search box |
| Logout | Click logout in navbar |

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Laptop (1366px+)
- ✅ Tablet (768px+)
- ✅ Mobile (320px+)

## 🔒 Security

- JWT authentication
- Password hashing (bcryptjs)
- Input validation
- Data sanitization
- Rate limiting (100 req/15min)
- CORS protection
- Security headers (Helmet)
- User data isolation

## 💡 Tips

- Use `npm dev` for development
- Check browser console (F12) for errors
- Check terminal for server errors
- Data persists between restarts
- Budget threshold customizable
- All amounts in Indian Rupees (₹)
- Backup data files regularly

## 🚀 Deployment

```bash
# Build frontend
npm run build --prefix client

# Update .env
NODE_ENV=production
JWT_SECRET=strong-random-string

# Deploy to hosting platform
# Backup users.json and expenses.json
```

## 📞 Support

1. Check `START-HERE.md` for quick setup
2. Check `QUICK-START-GUIDE.md` for detailed guide
3. Check browser console (F12) for errors
4. Check terminal for server errors
5. Review documentation files

## ✅ Setup Checklist

- [ ] Install dependencies
- [ ] Start backend
- [ ] Start frontend
- [ ] Open browser
- [ ] Create account
- [ ] Add expense
- [ ] Set budget
- [ ] Export data
- [ ] Test all features

## 🎉 Ready to Use!

Everything is set up and ready. Start with `START-HERE.md` for quick setup.

---

**Version**: 1.0.0
**Status**: Production Ready
**Last Updated**: February 13, 2026
