# 🚀 Complete Setup Guide

## Prerequisites

Before starting, ensure you have:
- **Node.js** >= 14.0.0 ([Download](https://nodejs.org/))
- **npm** >= 6.0.0 (comes with Node.js)
- **MongoDB** >= 4.0 ([Download](https://www.mongodb.com/try/download/community))
- **Git** (optional, for cloning)

## Step-by-Step Setup

### Step 1: Clone or Download Project

```bash
# Option A: Clone from Git
git clone <repository-url>
cd expense-tracker

# Option B: Extract downloaded ZIP
unzip expense-tracker.zip
cd expense-tracker
```

### Step 2: Backend Setup

#### 2.1 Install Backend Dependencies
```bash
npm install
```

Expected output:
```
added XXX packages in X.XXs
```

#### 2.2 Create Environment File
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
# On Windows: notepad .env
# On macOS/Linux: nano .env
```

#### 2.3 Configure Environment Variables

Edit `.env` file with these values:

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

**Important**: Change `JWT_SECRET` to a strong random string in production.

#### 2.4 Verify MongoDB Connection

```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/expense-tracker"

# If successful, you'll see:
# expense-tracker>

# Exit with: exit
```

### Step 3: Frontend Setup

#### 3.1 Navigate to Client Directory
```bash
cd client
```

#### 3.2 Install Frontend Dependencies
```bash
npm install
```

#### 3.3 Create Frontend Environment File
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:3000/api" > .env
```

Or manually create `client/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### Step 4: Start Application

#### 4.1 Start Backend Server

Open a new terminal and run:
```bash
# From project root directory
npm run dev
```

Expected output:
```
╔════════════════════════════════════════════════════════════╗
║         Expense Tracker Server Started                     ║
╚════════════════════════════════════════════════════════════╝

📍 Server URL: http://localhost:3000
📚 API Docs:   http://localhost:3000/api-docs
🔧 Environment: development
🗄️  Database:   MongoDB
```

#### 4.2 Start Frontend Server

Open another terminal and run:
```bash
# From project root directory
cd client
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 5: Access Application

Open your browser and navigate to:

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend | http://localhost:5173 | Main application |
| Backend API | http://localhost:3000/api | API endpoints |
| API Docs | http://localhost:3000/api-docs | Interactive documentation |
| Health Check | http://localhost:3000/api/health | Server status |

## 🧪 Testing Setup

### 1. Create Test Account

1. Go to http://localhost:5173/register
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: User
3. Click Register

### 2. Login

1. Go to http://localhost:5173/login
2. Enter credentials:
   - Email: test@example.com
   - Password: password123
3. Click Login

### 3. Test Features

#### Add Expense
1. Click "Add New Expense"
2. Fill in:
   - Description: Lunch
   - Amount: 250
   - Category: Food
   - Date: Today
3. Click "Add Expense"

#### Set Budget
1. Click "⚙️ Budget Settings"
2. Enter:
   - Monthly Budget: 10000
   - Warning Threshold: 80
3. Click "Save Budget"

#### Export Data
1. Click "📥 Export"
2. Choose export format:
   - Expenses Only
   - With Budget Summary
   - Monthly Summary
3. CSV file downloads automatically

#### View API Docs
1. Go to http://localhost:3000/api-docs
2. Explore all endpoints
3. Try "Try it out" on any endpoint

## 🔧 Troubleshooting

### Issue: Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
PORT=3001
```

### Issue: MongoDB Connection Failed

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:27017`

**Solution**:
```bash
# Start MongoDB
# On macOS with Homebrew:
brew services start mongodb-community

# On Windows:
# Start MongoDB from Services or run:
mongod

# On Linux:
sudo systemctl start mongod

# Verify connection:
mongosh
```

### Issue: npm install Fails

**Error**: `npm ERR! code ERESOLVE`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Install with legacy peer deps
npm install --legacy-peer-deps

# Or use npm 7+
npm install
```

### Issue: Frontend Shows White Page

**Error**: Blank page on http://localhost:5173

**Solution**:
```bash
# Check browser console (F12)
# Verify backend is running
# Clear browser cache (Ctrl+Shift+Delete)
# Reinstall dependencies
cd client
rm -rf node_modules
npm install
npm run dev
```

### Issue: API Docs Not Loading

**Error**: 404 on http://localhost:3000/api-docs

**Solution**:
```bash
# Verify backend is running
# Check if swagger-ui-express is installed
npm list swagger-ui-express

# Reinstall if needed
npm install swagger-ui-express swagger-jsdoc
```

## 📊 Verify Installation

### Backend Verification

```bash
# Check if backend is running
curl http://localhost:3000/api/health

# Expected response:
# {"success":true,"status":"ok","message":"Server is running with MongoDB",...}
```

### Frontend Verification

```bash
# Check if frontend is running
curl http://localhost:5173

# Should return HTML content
```

### Database Verification

```bash
# Connect to MongoDB
mongosh

# List databases
show dbs

# Use expense-tracker database
use expense-tracker

# List collections
show collections

# Check users collection
db.users.find()
```

## 🔐 Security Setup

### For Development

Current setup is fine for development. Just ensure:
- ✅ JWT_SECRET is set
- ✅ CORS_ORIGIN is correct
- ✅ NODE_ENV is "development"

### For Production

Before deploying:

1. **Change JWT_SECRET**
   ```bash
   # Generate strong secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Set NODE_ENV**
   ```env
   NODE_ENV=production
   ```

3. **Configure CORS**
   ```env
   CORS_ORIGIN=https://yourdomain.com
   ```

4. **Enable HTTPS**
   - Use SSL certificate
   - Update API URL to https://

5. **Secure MongoDB**
   - Enable authentication
   - Use connection string with credentials
   - Restrict network access

## 📚 Next Steps

### 1. Explore Features
- [ ] Add expenses
- [ ] Set budget
- [ ] View charts
- [ ] Export data
- [ ] Test filters

### 2. Review Documentation
- [ ] Read README.md
- [ ] Check SWAGGER-API-DOCS.md
- [ ] Review SECURITY.md
- [ ] Explore API docs at /api-docs

### 3. Customize
- [ ] Change app title
- [ ] Update colors/branding
- [ ] Add more categories
- [ ] Customize budget rules

### 4. Deploy
- [ ] Set up production environment
- [ ] Configure database
- [ ] Set up monitoring
- [ ] Deploy to server

## 🆘 Getting Help

### Documentation
- `README.md` - Project overview
- `SWAGGER-API-DOCS.md` - API reference
- `SECURITY.md` - Security guide
- `REFACTORING.md` - Code organization

### Interactive Help
- `/api-docs` - Swagger documentation
- Browser DevTools - Debug issues
- Console logs - Error messages

### Common Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# View logs
tail -f logs/app.log

# Reset database
npm run reset-data
```

## ✅ Setup Checklist

- [ ] Node.js and npm installed
- [ ] MongoDB installed and running
- [ ] Project cloned/extracted
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] .env file created and configured
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Can access http://localhost:5173
- [ ] Can access http://localhost:3000/api-docs
- [ ] Can create test account
- [ ] Can add expenses
- [ ] Can export data

## 🎉 You're Ready!

Once all items are checked, your Expense Tracker is ready to use!

### Quick Access Links
- **App**: http://localhost:5173
- **API**: http://localhost:3000/api
- **Docs**: http://localhost:3000/api-docs
- **Health**: http://localhost:3000/api/health

### First Steps
1. Register a new account
2. Add some expenses
3. Set a monthly budget
4. View charts and summaries
5. Export your data

---

**Need Help?** Check the troubleshooting section or review the documentation files.

**Happy Tracking! 💰**
