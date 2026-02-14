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
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// DATABASE SETUP
// ============================================================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

// ============================================================================
// LOGGING UTILITY
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
// DATABASE INITIALIZATION
// ============================================================================
async function initializeDatabase() {
  try {
    logger.info('Initializing PostgreSQL database...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info('✓ Users table ready');

    // Create expenses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info('✓ Expenses table ready');

    // Create budgets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        monthly_budget DECIMAL(10, 2),
        warning_threshold INTEGER DEFAULT 80,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info('✓ Budgets table ready');

    // Migrate data from JSON if it exists
    await migrateFromJSON();

    logger.info('✓ Database initialization complete');
  } catch (err) {
    logger.error('Database initialization failed', err);
    throw err;
  }
}

// ============================================================================
// DATA MIGRATION FROM JSON
// ============================================================================
async function migrateFromJSON() {
  try {
    const USERS_FILE = 'users.json';
    const EXPENSES_FILE = 'expenses.json';

    // Check if users need migration
    if (fs.existsSync(USERS_FILE)) {
      const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      const existingUsers = await pool.query('SELECT COUNT(*) FROM users');
      
      if (existingUsers.rows[0].count === 0 && usersData.length > 0) {
        logger.info('Migrating users from JSON...', { count: usersData.length });
        
        for (const user of usersData) {
          await pool.query(
            'INSERT INTO users (id, name, email, password, role, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
            [user.id || require('crypto').randomUUID(), user.name, user.email, user.password, user.role, user.createdAt]
          );
        }
        logger.info('✓ Users migrated successfully');
      }
    }

    // Check if expenses need migration
    if (fs.existsSync(EXPENSES_FILE)) {
      const expensesData = JSON.parse(fs.readFileSync(EXPENSES_FILE, 'utf8'));
      const existingExpenses = await pool.query('SELECT COUNT(*) FROM expenses');
      
      if (existingExpenses.rows[0].count === 0 && expensesData.length > 0) {
        logger.info('Migrating expenses from JSON...', { count: expensesData.length });
        
        for (const expense of expensesData) {
          await pool.query(
            'INSERT INTO expenses (id, user_id, description, amount, category, date, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING',
            [expense._id || require('crypto').randomUUID(), expense.userId, expense.description, expense.amount, expense.category, expense.date, expense.createdAt]
          );
        }
        logger.info('✓ Expenses migrated successfully');
      }
    }
  } catch (err) {
    logger.warn('Migration from JSON skipped', err.message);
  }
}

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || function(origin, callback) {
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
    path: req.path
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
  }
});
app.use(limiter);

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'default-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// ============================================================================
// ROUTES
// ============================================================================

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Expense Tracker API (PostgreSQL)',
    endpoints: {
      health: '/health',
      register: '/api/auth/register',
      login: '/api/auth/login'
    }
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = result.rows[0].count;
    
    res.json({
      success: true,
      status: 'healthy',
      database: 'PostgreSQL',
      users: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: err.message
    });
  }
});

// ============================================================================
// AUTH ROUTES
// ============================================================================

// Register
app.post('/api/auth/register', [
  body('name').trim().notEmpty().isLength({ min: 2, max: 50 }).escape(),
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('password').notEmpty().isLength({ min: 6 }),
  validate
], async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    logger.info('Registration attempt', { email });

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      logger.warn('Registration failed: email already exists', { email });
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'user']
    );

    logger.info('Registration successful', { email, userId: result.rows[0].id });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please login.',
      user: result.rows[0]
    });
  } catch (error) {
    logger.error('Registration error', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
app.post('/api/auth/login', [
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate
], async (req, res) => {
  const { email, password } = req.body;
  
  try {
    logger.info('Login attempt', { email });

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      logger.warn('Login failed: user not found', { email });
      return res.status(401).json({ success: false, message: 'There is no user with this email' });
    }

    const user = result.rows[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      logger.warn('Login failed: invalid password', { email });
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    logger.info('Login successful', { email, userId: user.id });

    const token = generateToken(user.id);

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

// ============================================================================
// EXPENSE ROUTES
// ============================================================================

// Get all expenses
app.get('/api/expenses', [
  authenticate,
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  query('category').optional().isIn(['Food', 'Travelling', 'Entertainment', 'Shopping', 'Bills', 'Other']).withMessage('Invalid category'),
  validate
], async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC',
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        _id: row.id,
        userId: row.user_id,
        description: row.description,
        amount: parseFloat(row.amount),
        category: row.category,
        date: row.date,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    logger.error('Get expenses error', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add expense
app.post('/api/expenses', [
  authenticate,
  body('description').trim().notEmpty().isLength({ min: 3, max: 200 }).escape(),
  body('amount').notEmpty().isFloat({ min: 0 }),
  body('category').trim().notEmpty().isIn(['Food', 'Travelling', 'Entertainment', 'Shopping', 'Bills', 'Other']).withMessage('Invalid category'),
  body('date').notEmpty().isISO8601(),
  validate
], async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;

    const result = await pool.query(
      'INSERT INTO expenses (user_id, description, amount, category, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, description, amount, category, date]
    );

    res.status(201).json({
      success: true,
      data: {
        _id: result.rows[0].id,
        userId: result.rows[0].user_id,
        description: result.rows[0].description,
        amount: parseFloat(result.rows[0].amount),
        category: result.rows[0].category,
        date: result.rows[0].date
      }
    });
  } catch (error) {
    logger.error('Add expense error', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update expense
app.put('/api/expenses/:id', [
  authenticate,
  param('id').notEmpty(),
  body('description').optional().trim().isLength({ min: 3, max: 200 }).escape(),
  body('amount').optional().isFloat({ min: 0 }),
  body('category').optional().trim().isIn(['Food', 'Travelling', 'Entertainment', 'Shopping', 'Bills', 'Other']).withMessage('Invalid category'),
  body('date').optional().isISO8601(),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category, date } = req.body;

    const result = await pool.query(
      'UPDATE expenses SET description = COALESCE($1, description), amount = COALESCE($2, amount), category = COALESCE($3, category), date = COALESCE($4, date) WHERE id = $5 AND user_id = $6 RETURNING *',
      [description, amount, category, date, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({
      success: true,
      data: {
        _id: result.rows[0].id,
        userId: result.rows[0].user_id,
        description: result.rows[0].description,
        amount: parseFloat(result.rows[0].amount),
        category: result.rows[0].category,
        date: result.rows[0].date
      }
    });
  } catch (error) {
    logger.error('Update expense error', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete expense
app.delete('/api/expenses/:id', [authenticate, param('id').notEmpty(), validate], async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    logger.error('Delete expense error', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// BUDGET ROUTES
// ============================================================================

// Get budget
app.get('/api/budget', authenticate, async (req, res) => {
  try {
    const budgetResult = await pool.query(
      'SELECT * FROM budgets WHERE user_id = $1',
      [req.user.id]
    );

    const expensesResult = await pool.query(
      'SELECT SUM(amount) as total FROM expenses WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)',
      [req.user.id]
    );

    const budget = budgetResult.rows[0];
    const totalSpent = parseFloat(expensesResult.rows[0].total) || 0;

    if (!budget) {
      return res.json({
        success: true,
        data: {
          budget: null,
          totalSpent: 0,
          isWarning: false,
          isExceeded: false
        }
      });
    }

    const budgetAmount = parseFloat(budget.monthly_budget);
    const isWarning = totalSpent >= (budgetAmount * budget.warning_threshold / 100);
    const isExceeded = totalSpent > budgetAmount;

    res.json({
      success: true,
      data: {
        budget: budgetAmount,
        totalSpent,
        warningThreshold: budget.warning_threshold,
        isWarning,
        isExceeded
      }
    });
  } catch (error) {
    logger.error('Get budget error', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update budget
app.put('/api/budget', [
  authenticate,
  body('monthlyBudget').notEmpty().isFloat({ min: 0 }),
  body('warningThreshold').optional().isInt({ min: 0, max: 100 }),
  validate
], async (req, res) => {
  try {
    const { monthlyBudget, warningThreshold } = req.body;

    const result = await pool.query(
      'INSERT INTO budgets (user_id, monthly_budget, warning_threshold) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET monthly_budget = $2, warning_threshold = COALESCE($3, budgets.warning_threshold), updated_at = CURRENT_TIMESTAMP RETURNING *',
      [req.user.id, monthlyBudget, warningThreshold || 80]
    );

    res.json({
      success: true,
      data: {
        budget: parseFloat(result.rows[0].monthly_budget),
        warningThreshold: result.rows[0].warning_threshold
      }
    });
  } catch (error) {
    logger.error('Update budget error', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// EXPORT ROUTES
// ============================================================================

// Export expenses
app.get('/api/export/expenses', [
  authenticate,
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  validate
], async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC',
      [req.user.id]
    );

    const csv = [
      ['Date', 'Description', 'Category', 'Amount'].join(','),
      ...result.rows.map(row => 
        [row.date, `"${row.description}"`, row.category, row.amount].join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  } catch (error) {
    logger.error('Export expenses error', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

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

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`, { 
        environment: process.env.NODE_ENV || 'development',
        database: 'PostgreSQL',
        corsOrigin: process.env.CORS_ORIGIN
      });
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

module.exports = app;
