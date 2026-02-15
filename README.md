# 💰 Expense Tracker

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-black?logo=express)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen)](https://github.com/adarshgupta09182/expense-tracker)
[![Deployed](https://img.shields.io/badge/Deployed-Railway%20%26%20Netlify-blue)](https://sensational-croissant-62fb1f.netlify.app)

A comprehensive full-stack expense tracking application with budget management, data visualization, dark mode, and advanced analytics.

## ✨ Features

### Core Features
- ✅ **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
- ✅ **Password Reset** - Forgot password functionality with email verification
- ✅ **Expense Management** - Create, read, update, and delete expenses with real-time updates
- ✅ **Budget Tracking** - Set monthly budgets with customizable warning thresholds
- ✅ **Data Visualization** - Interactive charts using Chart.js (Bar & Pie charts)
- ✅ **Advanced Filtering** - Filter by category, date range, and search description
- ✅ **CSV Export** - Export expenses with multiple format options
- ✅ **Monthly Summary** - Aggregated expense data by month and category
- ✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### Premium Features
- 🌙 **Dark Mode** - Full dark theme support with system preference detection
- 📊 **Statistics Insights** - Advanced analytics including spending trends, daily averages, and projections
- ✨ **Smooth Animations** - Meaningful transitions and loading states with professional UI
- 📱 **Mobile Optimized** - Enhanced responsive design for all screen sizes
- 🎨 **Modern UI** - CSS variables for easy theming and consistent design
- 👋 **Welcome Message** - Personalized welcome overlay for returning users on login
- 🎯 **Modern Auth Pages** - Two-column layout with hero section and smooth animations

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
- ⚡ **CSS Variables** - Dynamic theming without page reload
- ⚡ **Lazy Loading** - Components load on demand

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT + bcryptjs
- **Security**: Helmet, CORS, Rate Limiting, express-validator
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Charts**: Chart.js + react-chartjs-2
- **State Management**: React Context API
- **Styling**: CSS Variables + Vanilla CSS with animations

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** for version control

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/adarshgupta09182/expense-tracker.git
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
# - PORT=3002
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
echo "VITE_API_URL=http://localhost:3002" > .env

# Start development server
npm run dev
```

### 4. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3002/api
- **API Documentation**: http://localhost:3002/api-docs
- **Health Check**: http://localhost:3002/api/health

## 📁 Project Structure

```
expense-tracker/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components (Login, Register, Dashboard)
│   │   ├── components/       # Reusable components (13 total)
│   │   ├── context/          # React Context (Auth, Theme)
│   │   ├── utils/            # Utilities (axios config)
│   │   ├── theme.css         # CSS variables for dark mode
│   │   └── index.css         # Global styles with animations
│   ├── __tests__/            # Frontend tests
│   ├── package.json
│   └── vite.config.js
├── __tests__/                # Backend tests
├── server.js                 # Main server (JSON storage)
├── package.json              # Backend dependencies
├── .env.example              # Environment template
└── README.md                 # This file
```

## 🎨 Dark Mode

The application includes a full dark mode implementation:

- **Automatic Detection**: Respects system color scheme preference
- **Manual Toggle**: Theme toggle button in navbar
- **Persistent**: Theme preference saved to localStorage
- **Smooth Transitions**: CSS transitions between themes
- **CSS Variables**: Easy customization via CSS variables

### Using Dark Mode
1. Click the theme toggle button (☀️/🌙) in the navbar
2. Or set your system to dark mode for automatic detection
3. Your preference is saved automatically

## 📊 Statistics & Insights

The dashboard includes advanced analytics:

- **Average Expense**: Per transaction average
- **Daily Average**: Last 7 days spending pattern
- **Top Category**: Highest spending category
- **Monthly Projection**: Estimated month-end spending
- **Spending Trend**: Comparison with historical average
- **Budget Status**: Real-time budget tracking

## 🔐 Environment Variables

### Backend (.env)
```env
# Server
PORT=3002
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend (client/.env)
```env
VITE_API_URL=http://localhost:3002
```

## 📚 API Documentation

### Interactive API Docs
Visit http://localhost:3002/api-docs for interactive Swagger documentation

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/reset-password` - Reset user password

#### Expenses
- `GET /api/expenses` - Get all expenses (with filters)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary/monthly` - Monthly summary

#### Budget
- `GET /api/budget` - Get current budget status
- `PUT /api/budget` - Update budget settings

#### Export
- `GET /api/export/expenses` - Export expenses as CSV

## 🧪 Testing

### Run Tests
```bash
# Backend tests
npm test

# Backend tests with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

### Test Coverage
- ✅ Authentication endpoints (register, login)
- ✅ Input validation
- ✅ Error handling
- ✅ Frontend components (SummaryCards, etc.)

## 🔑 Authentication

All protected endpoints require JWT token in Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## 💾 Data Storage

The application uses PostgreSQL for reliable data persistence:

- **users** - User accounts and credentials
- **expenses** - All expense records
- **budgets** - Budget settings and history

PostgreSQL provides ACID compliance, scalability, and data integrity.

## 📈 Performance Optimization

### Backend
- Rate limiting to prevent abuse
- Request body size limit (10kb)
- Efficient JSON parsing and filtering

### Frontend
- React.memo for component optimization
- useCallback for event handlers
- useMemo for expensive calculations
- Pagination for large datasets
- CSS variables for instant theme switching

## 🔒 Security Best Practices

1. **Change JWT_SECRET** in production
2. **Use HTTPS** in production
3. **Set NODE_ENV=production** in production
4. **Configure CORS_ORIGIN** to specific domain
5. **Keep dependencies updated** - `npm audit`
6. **Use environment variables** for sensitive data
7. **Enable request logging** in production
8. **Set up monitoring** (PM2, New Relic)
9. **Regular security audits**
10. **Backup data regularly**

## 🐛 Troubleshooting

### Backend Issues

**Port Already in Use**
```bash
# Windows
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3002 | xargs kill -9
```

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

## 📱 Responsive Design

The application is fully responsive:

- **Desktop**: Full-featured layout (1200px+)
- **Tablet**: Optimized grid layout (768px - 1199px)
- **Mobile**: Single column layout (<768px)
- **Small Mobile**: Compact layout (<480px)

## 🚀 Deployment

### Live Application
- **Frontend**: https://expense-tracker-rho-brown.vercel.app
- **Backend API**: https://web-production-43d51.up.railway.app

### Deploy to Railway (Backend)
1. Push code to GitHub
2. Connect Railway to GitHub repository
3. Set environment variables in Railway dashboard
4. Railway auto-deploys on push

### Deploy to Vercel (Frontend)
1. Push code to GitHub
2. Connect Vercel to GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Vercel auto-deploys on push

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Express.js for the web framework
- React for the UI framework
- Chart.js for data visualization
- All open-source contributors

## 📞 Support

For issues and questions:
1. Check documentation files
2. Review API documentation at `/api-docs`
3. Check browser console for errors
4. Verify environment variables
5. Check GitHub issues

## 🎯 Future Enhancements

- [ ] Category-specific budgets
- [ ] Email/SMS alerts
- [ ] Budget forecasting
- [ ] Recurring expenses
- [ ] Multi-currency support
- [ ] Family budget sharing
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Spending recommendations
- [ ] Data import/export

---

**Happy Tracking! 💰**

Last Updated: February 2026
Version: 2.1.0 (Password Reset & Modern Auth UI)
