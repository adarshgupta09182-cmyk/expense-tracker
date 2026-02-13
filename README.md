# 💰 Expense Tracker

A comprehensive full-stack expense tracking application with budget management, data visualization, and CSV export functionality.

## 🌟 Features

### Core Features
- ✅ **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
- ✅ **Expense Management** - Create, read, update, and delete expenses
- ✅ **Budget Tracking** - Set monthly budgets with customizable warning thresholds
- ✅ **Data Visualization** - Interactive charts using Chart.js (Bar & Pie charts)
- ✅ **Advanced Filtering** - Filter by category, date range, and search description
- ✅ **CSV Export** - Export expenses with multiple format options
- ✅ **Monthly Summary** - Aggregated expense data by month and category
- ✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### Security Features
- 🔒 **Helmet.js** - HTTP header security
- 🔒 **CORS** - Cross-origin resource sharing protection
- 🔒 **Rate Limiting** - Brute force attack prevention
- 🔒 **Input Validation** - Express-validator for all inputs
- 🔒 **Data Sanitization** - NoSQL injection prevention
- 🔒 **JWT Authentication** - Secure token-based auth
- 🔒 **Password Hashing** - bcryptjs with 12 rounds

### Performance Features
- ⚡ **React Hooks** - useCallback and useMemo for optimization
- ⚡ **Pagination** - Efficient data loading (10 items per page)
- ⚡ **MongoDB Indexing** - Fast queries on userId and date
- ⚡ **Aggregation Pipeline** - Efficient server-side calculations

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Security**: Helmet, CORS, Rate Limiting, express-validator
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Charts**: Chart.js + react-chartjs-2
- **State Management**: React Context API

## 📋 Prerequisites

- **Node.js** >= 14.0.0
- **npm** >= 6.0.0
- **MongoDB** >= 4.0 (local or cloud)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd expense-tracker
```

### 2. Backend Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
# Edit .env with your settings:
# - PORT=3000
# - MONGODB_URI=mongodb://localhost:27017/expense-tracker
# - JWT_SECRET=your-secret-key-here
# - NODE_ENV=development
# - CORS_ORIGIN=http://localhost:5173

# Start backend server
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Start development server
npm run dev
```

### 4. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health

## 📁 Project Structure

```
expense-tracker/
├── config/                    # Configuration files
│   ├── db.js                 # MongoDB connection
│   └── swagger.js            # Swagger/OpenAPI config
├── controllers/              # Business logic
│   ├── authController.js     # Authentication
│   ├── expenseController.js  # Expense CRUD
│   ├── budgetController.js   # Budget management
│   ├── exportController.js   # Data export
│   └── adminController.js    # Admin dashboard
├── middleware/               # Express middleware
│   ├── auth.js              # JWT verification
│   ├── validators.js        # Input validation
│   └── errorHandler.js      # Error handling
├── models/                   # MongoDB schemas
│   ├── User.js              # User model
│   └── Expense.js           # Expense model
├── routes/                   # API routes
│   ├── auth.js              # Auth endpoints
│   ├── expenses.js          # Expense endpoints
│   ├── budget.js            # Budget endpoints
│   ├── export.js            # Export endpoints
│   └── admin.js             # Admin endpoints
├── utils/                    # Utility functions
│   └── asyncHandler.js      # Async error wrapper
├── client/                   # React frontend
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context
│   │   └── utils/           # Utilities
│   ├── package.json
│   └── vite.config.js
├── public/                   # Static files
├── server-mongodb.js        # Main server entry
├── package.json             # Backend dependencies
├── .env.example             # Environment template
└── README.md               # This file
```

## 🔐 Environment Variables

### Backend (.env)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/expense-tracker

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend (client/.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 📚 API Documentation

### Interactive API Docs
Visit http://localhost:3000/api-docs for interactive Swagger documentation

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

#### Expenses
- `GET /api/expenses` - Get all expenses (with filters)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary/monthly` - Monthly summary

#### Budget
- `GET /api/budget` - Get current budget status
- `PUT /api/budget` - Update budget settings
- `GET /api/budget/history` - Get 12-month history

#### Export
- `GET /api/export/expenses` - Export expenses as CSV
- `GET /api/export/expenses-with-budget` - Export with budget summary
- `GET /api/export/monthly-summary` - Export monthly summary

#### Admin
- `GET /api/admin/dashboard` - Admin dashboard data

## 🔑 Authentication

All protected endpoints require JWT token in Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## 💾 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user|admin),
  monthlyBudget: Number,
  budgetWarningThreshold: Number,
  createdAt: Date
}
```

### Expense Model
```javascript
{
  userId: ObjectId (ref: User),
  description: String,
  amount: Number,
  category: String (Food|Transport|Entertainment|Bills|Other),
  date: Date,
  createdAt: Date
}
```

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error)
- [ ] Forgot password flow
- [ ] Session persistence on refresh

#### Expenses
- [ ] Add new expense
- [ ] Edit existing expense
- [ ] Delete expense
- [ ] Filter by category
- [ ] Filter by date range
- [ ] Search by description
- [ ] Pagination works

#### Budget
- [ ] Set monthly budget
- [ ] Update budget
- [ ] View budget status
- [ ] Warning at 80%
- [ ] Alert when exceeded
- [ ] View budget history

#### Export
- [ ] Export expenses as CSV
- [ ] Export with budget summary
- [ ] Export monthly summary
- [ ] File downloads correctly

#### UI/UX
- [ ] Responsive on mobile
- [ ] Charts render correctly
- [ ] Loading states show
- [ ] Error messages display
- [ ] Form validation works

## 🐛 Troubleshooting

### Backend Issues

**Port Already in Use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

**MongoDB Connection Error**
- Verify MongoDB is running
- Check MONGODB_URI in .env
- Ensure database exists

**JWT Errors**
- Verify JWT_SECRET is set
- Check token expiration
- Ensure Authorization header format

### Frontend Issues

**White Page on Dashboard**
- Check browser console for errors
- Verify backend is running
- Clear browser cache
- Run `npm install` in client directory

**API Calls Failing**
- Check VITE_API_URL in .env
- Verify backend is running
- Check network tab in DevTools
- Verify JWT token is valid

## 📊 Performance Optimization

### Backend
- MongoDB indexes on userId and date
- Aggregation pipeline for calculations
- Rate limiting to prevent abuse
- Request body size limit (10kb)

### Frontend
- React.memo for component optimization
- useCallback for event handlers
- useMemo for expensive calculations
- Pagination for large datasets
- Lazy loading of components

## 🔒 Security Best Practices

1. **Change JWT_SECRET** in production
2. **Use HTTPS** in production
3. **Enable MongoDB authentication**
4. **Set NODE_ENV=production**
5. **Configure CORS_ORIGIN** to specific domain
6. **Keep dependencies updated** - `npm audit`
7. **Use environment variables** for sensitive data
8. **Enable request logging** in production
9. **Set up monitoring** (PM2, New Relic)
10. **Regular security audits**

## 📈 Future Enhancements

- [ ] Category-specific budgets
- [ ] Email/SMS alerts
- [ ] Budget forecasting
- [ ] Recurring expenses
- [ ] Multi-currency support
- [ ] Family budget sharing
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Advanced analytics
- [ ] Spending recommendations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 📞 Support

For issues and questions:
1. Check documentation files
2. Review API documentation at `/api-docs`
3. Check browser console for errors
4. Verify environment variables
5. Check MongoDB connection

## 🙏 Acknowledgments

- Express.js for the web framework
- MongoDB for the database
- React for the UI framework
- Chart.js for data visualization
- All open-source contributors

---

**Happy Tracking! 💰**

Last Updated: February 2026
