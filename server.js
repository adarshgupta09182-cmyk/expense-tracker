require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, param, query, validationResult } = require('express-validator');
const { ensureDataFiles } = require('./preserve-data');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = 'expenses.json';
const USERS_FILE = 'users.json';

// Ensure data files exist and are valid on startup
ensureDataFiles();

// ============================================================================
// LOGGING UTILITY (Production-safe)
// ============================================================================
const logger = {
  info: (msg, data = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data);
  },
  error: (msg, err = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err.message || err);
  },
  warn: (msg, data = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, data);
  }
};

// ============================================================================
// DATABASE PERSISTENCE CHECK
// ============================================================================
const initializeDatabase = () => {
  logger.info('Initializing database files...');
  
  // Ensure users.json exists and is valid
  if (!fs.existsSync(USERS_FILE)) {
    logger.warn('users.json not found, creating new file');
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  } else {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      JSON.parse(data); // Validate JSON
      logger.info('users.json loaded successfully', { userCount: JSON.parse(data).length });
    } catch (err) {
      logger.error('users.json is corrupted, resetting', err);
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
    }
  }

  // Ensure expenses.json exists and is valid
  if (!fs.existsSync(DATA_FILE)) {
    logger.warn('expenses.json not found, creating new file');
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  } else {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      JSON.parse(data); // Validate JSON
      logger.info('expenses.json loaded successfully', { expenseCount: JSON.parse(data).length });
    } catch (err) {
      logger.error('expenses.json is corrupted, resetting', err);
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    }
  }
};

// Initialize on startup
initializeDatabase();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || function(origin, callback) {
    // Allow all origins in development
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};
app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', { 
    method: req.method, 
    path: req.path,
    url: req.originalUrl,
    headers: req.headers
  });
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Expense Tracker API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      register: '/api/auth/register',
      login: '/api/auth/login'
    }
  });
});

// Health check (before rate limiter)
app.get('/health', (req, res) => {
  const userCount = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')).length;
  res.json({
    success: true,
    status: 'ok',
    message: 'Server is running (JSON file storage)',
    timestamp: new Date().toISOString(),
    database: {
      type: 'JSON File',
      users: userCount,
      persistent: true
    }
  });
});

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Static files - only serve in development
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static('public'));
}

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'default-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Auth routes
app.post('/api/auth/register', [
  body('name').trim().notEmpty().isLength({ min: 2, max: 50 }).escape(),
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('password').notEmpty().isLength({ min: 6 }),
  validate
], async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    logger.info('Registration attempt', { email, name });
    
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

    if (users.find(u => u.email === email)) {
      logger.warn('Registration failed: email already exists', { email });
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    logger.info('Hashing password', { email });
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = {
      id: Date.now(),
      name,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(user);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    logger.info('Registration successful', { email, userId: user.id });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please login with your credentials.'
    });
  } catch (error) {
    logger.error('Registration error', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', [
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate
], async (req, res) => {
  const { email, password } = req.body;
  
  try {
    logger.info('Login attempt', { email });
    
    // Read users from persistent storage
    const usersData = fs.readFileSync(USERS_FILE, 'utf8');
    const users = JSON.parse(usersData);
    
    logger.info('Users file loaded', { totalUsers: users.length });

    // Find user by email
    const user = users.find(u => u.email === email);
    
    if (!user) {
      logger.warn('Login failed: user not found', { email });
      return res.status(401).json({ success: false, message: 'There is no user with this email' });
    }

    logger.info('User found, comparing password', { email, userId: user.id });

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      logger.warn('Login failed: invalid password', { email });
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    logger.info('Password valid, generating token', { email, userId: user.id });

    const token = generateToken(user.id);

    logger.info('Login successful', { email, userId: user.id });

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    logger.error('Login error', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/reset-password', [
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('newPassword').notEmpty().isLength({ min: 6 }),
  validate
], async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    users[userIndex].password = hashedPassword;
    users[userIndex].updatedAt = new Date().toISOString();

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Expense routes
app.get('/api/expenses', [
  authenticate,
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  query('category').optional().isIn(['Food', 'Transport', 'Entertainment', 'Bills', 'Other']),
  validate
], (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    let userExpenses = data.filter(e => e.userId === req.user.id);

    if (startDate || endDate) {
      userExpenses = userExpenses.filter(e => {
        const expenseDate = new Date(e.date);
        if (startDate && expenseDate < new Date(startDate)) return false;
        if (endDate && expenseDate > new Date(endDate)) return false;
        return true;
      });
    }

    if (category) {
      userExpenses = userExpenses.filter(e => e.category === category);
    }

    res.json({ success: true, count: userExpenses.length, data: userExpenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/expenses/summary/monthly', authenticate, (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const userExpenses = data.filter(e => e.userId === req.user.id);

    const summary = {};
    userExpenses.forEach(e => {
      const date = new Date(e.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!summary[key]) {
        summary[key] = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          totalAmount: 0,
          totalCount: 0,
          byCategory: {}
        };
      }
      
      summary[key].totalAmount += e.amount;
      summary[key].totalCount++;
      
      if (!summary[key].byCategory[e.category]) {
        summary[key].byCategory[e.category] = { amount: 0, count: 0 };
      }
      summary[key].byCategory[e.category].amount += e.amount;
      summary[key].byCategory[e.category].count++;
    });

    const result = Object.values(summary).map(s => ({
      ...s,
      byCategory: Object.entries(s.byCategory).map(([category, data]) => ({
        category,
        ...data
      }))
    })).sort((a, b) => b.year - a.year || b.month - a.month);

    res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/expenses/:id', [authenticate, param('id').notEmpty(), validate], (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const expense = data.find(e => e._id === req.params.id && e.userId === req.user.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/expenses', [
  authenticate,
  body('description').trim().notEmpty().isLength({ min: 3, max: 200 }).escape(),
  body('amount').notEmpty().isFloat({ min: 0.01 }),
  body('category').notEmpty().isIn(['Food', 'Transport', 'Entertainment', 'Bills', 'Other']),
  body('date').optional().isISO8601().toDate(),
  validate
], (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    const expense = {
      _id: Date.now().toString(),
      userId: req.user.id,
      description,
      amount: parseFloat(amount),
      category,
      date: date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    data.push(expense);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/expenses/:id', [
  authenticate,
  param('id').notEmpty(),
  body('description').optional().trim().isLength({ min: 3, max: 200 }).escape(),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('category').optional().isIn(['Food', 'Transport', 'Entertainment', 'Bills', 'Other']),
  body('date').optional().isISO8601().toDate(),
  validate
], (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const index = data.findIndex(e => e._id === req.params.id && e.userId === req.user.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (description) data[index].description = description;
    if (amount) data[index].amount = parseFloat(amount);
    if (category) data[index].category = category;
    if (date) data[index].date = date;

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.json({ success: true, data: data[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/expenses/:id', [authenticate, param('id').notEmpty(), validate], (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const filtered = data.filter(e => !(e._id === req.params.id && e.userId === req.user.id));

    if (data.length === filtered.length) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2));

    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Budget routes
app.get('/api/budget', authenticate, (req, res) => {
  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get current month expenses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const monthlyExpenses = data.filter(e => {
      if (e.userId !== req.user.id) return false;
      const expenseDate = new Date(e.date);
      return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
    });

    const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const budget = user.monthlyBudget || 0;
    const remaining = budget - totalSpent;
    const percentageUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;
    const isExceeded = totalSpent > budget;
    const isWarning = percentageUsed >= (user.budgetWarningThreshold || 80) && !isExceeded;

    res.json({
      success: true,
      data: {
        budget,
        totalSpent,
        remaining,
        percentageUsed: Math.round(percentageUsed * 100) / 100,
        isExceeded,
        isWarning,
        warningThreshold: user.budgetWarningThreshold || 80,
        month: now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/budget', [
  authenticate,
  body('monthlyBudget').notEmpty().isFloat({ min: 0 }),
  body('budgetWarningThreshold').optional().isInt({ min: 0, max: 100 }),
  validate
], (req, res) => {
  try {
    const { monthlyBudget, budgetWarningThreshold } = req.body;
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const userIndex = users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    users[userIndex].monthlyBudget = parseFloat(monthlyBudget);
    if (budgetWarningThreshold !== undefined) {
      users[userIndex].budgetWarningThreshold = parseInt(budgetWarningThreshold);
    }

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: {
        monthlyBudget: users[userIndex].monthlyBudget,
        budgetWarningThreshold: users[userIndex].budgetWarningThreshold || 80
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/budget/history', authenticate, (req, res) => {
  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const budget = user.monthlyBudget || 0;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const userExpenses = data.filter(e => e.userId === req.user.id);
    const history = [];

    // Get last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthlyExpenses = userExpenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
      });

      const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
      const percentageUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;

      history.push({
        month: startOfMonth.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        budget,
        spent: totalSpent,
        remaining: budget - totalSpent,
        percentageUsed: Math.round(percentageUsed * 100) / 100,
        isExceeded: totalSpent > budget
      });
    }

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export routes
const generateCSVContent = (expenses) => {
  if (!expenses || expenses.length === 0) {
    return 'Date,Description,Category,Amount\n';
  }

  const headers = ['Date', 'Description', 'Category', 'Amount (₹)'];
  const csvRows = [headers.join(',')];

  expenses.forEach(expense => {
    const date = new Date(expense.date).toLocaleDateString('en-IN');
    const description = `"${expense.description.replace(/"/g, '""')}"`;
    const category = expense.category;
    const amount = expense.amount.toFixed(2);
    csvRows.push(`${date},${description},${category},${amount}`);
  });

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  csvRows.push('');
  csvRows.push(`Total,,,${totalAmount.toFixed(2)}`);

  return csvRows.join('\n');
};

app.get('/api/export/expenses', [
  authenticate,
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  query('category').optional().isIn(['Food', 'Transport', 'Entertainment', 'Bills', 'Other']),
  validate
], (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    let expenses = data.filter(e => e.userId === req.user.id);

    if (startDate || endDate) {
      expenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        if (startDate && expenseDate < new Date(startDate)) return false;
        if (endDate && expenseDate > new Date(endDate)) return false;
        return true;
      });
    }

    if (category) {
      expenses = expenses.filter(e => e.category === category);
    }

    if (!expenses || expenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No expenses found for the specified criteria'
      });
    }

    const csvContent = generateCSVContent(expenses);
    const filename = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/export/expenses-with-budget', [
  authenticate,
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  query('category').optional().isIn(['Food', 'Transport', 'Entertainment', 'Bills', 'Other']),
  validate
], (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const user = users.find(u => u.id === req.user.id);
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    
    let expenses = data.filter(e => e.userId === req.user.id);

    if (startDate || endDate) {
      expenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        if (startDate && expenseDate < new Date(startDate)) return false;
        if (endDate && expenseDate > new Date(endDate)) return false;
        return true;
      });
    }

    if (category) {
      expenses = expenses.filter(e => e.category === category);
    }

    let csvContent = 'EXPENSE REPORT\n';
    csvContent += `Generated: ${new Date().toLocaleString('en-IN')}\n`;
    csvContent += `User: ${user.name} (${user.email})\n`;
    csvContent += '\n';

    if (user.monthlyBudget > 0) {
      const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const remaining = user.monthlyBudget - totalSpent;
      const percentageUsed = (totalSpent / user.monthlyBudget) * 100;

      csvContent += 'BUDGET SUMMARY\n';
      csvContent += `Monthly Budget,₹${user.monthlyBudget.toFixed(2)}\n`;
      csvContent += `Total Spent,₹${totalSpent.toFixed(2)}\n`;
      csvContent += `Remaining,₹${remaining.toFixed(2)}\n`;
      csvContent += `Usage,${percentageUsed.toFixed(2)}%\n`;
      csvContent += '\n';
    }

    csvContent += 'EXPENSES\n';
    csvContent += generateCSVContent(expenses);

    if (expenses.length > 0) {
      csvContent += '\n\nCATEGORY BREAKDOWN\n';
      csvContent += 'Category,Amount (₹),Count\n';

      const categoryBreakdown = {};
      expenses.forEach(exp => {
        if (!categoryBreakdown[exp.category]) {
          categoryBreakdown[exp.category] = { amount: 0, count: 0 };
        }
        categoryBreakdown[exp.category].amount += exp.amount;
        categoryBreakdown[exp.category].count += 1;
      });

      Object.entries(categoryBreakdown).forEach(([cat, data]) => {
        csvContent += `${cat},${data.amount.toFixed(2)},${data.count}\n`;
      });
    }

    const filename = `expense-report_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/export/monthly-summary', authenticate, (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const userExpenses = data.filter(e => e.userId === req.user.id);

    const summary = {};
    userExpenses.forEach(e => {
      const date = new Date(e.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!summary[key]) {
        summary[key] = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          totalAmount: 0,
          totalCount: 0
        };
      }
      
      summary[key].totalAmount += e.amount;
      summary[key].totalCount += 1;
    });

    const summaryArray = Object.values(summary).sort((a, b) => b.year - a.year || b.month - a.month);

    if (!summaryArray || summaryArray.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No expense data available'
      });
    }

    let csvContent = 'MONTHLY EXPENSE SUMMARY\n';
    csvContent += `Generated: ${new Date().toLocaleString('en-IN')}\n\n`;
    csvContent += 'Month,Total Expenses (₹),Transaction Count\n';

    summaryArray.forEach(item => {
      const monthName = new Date(item.year, item.month - 1).toLocaleString('en-IN', {
        month: 'long',
        year: 'numeric'
      });
      csvContent += `${monthName},${item.totalAmount.toFixed(2)},${item.totalCount}\n`;
    });

    const grandTotal = summaryArray.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalTransactions = summaryArray.reduce((sum, item) => sum + item.totalCount, 0);
    csvContent += `\nTotal,${grandTotal.toFixed(2)},${totalTransactions}`;

    const filename = `monthly-summary_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, { 
    environment: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN
  });
});
