require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, param, query, validationResult } = require('express-validator');
const { Pool } = require('pg');
const { Resend } = require('resend');

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

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

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
        is_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        verification_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info('✓ Users table ready');

    // Add verification columns if they don't exist (for existing tables)
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;
    `).catch(() => {}); // Ignore error if columns already exist

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

    // Migrate Transport category to Travelling
    await migrateTransportToTravelling();

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
// MIGRATE TRANSPORT TO TRAVELLING
// ============================================================================
async function migrateTransportToTravelling() {
  try {
    const result = await pool.query(
      'UPDATE expenses SET category = $1 WHERE category = $2',
      ['Travelling', 'Transport']
    );
    
    if (result.rowCount > 0) {
      logger.info(`✓ Migrated ${result.rowCount} expenses from Transport to Travelling`);
    }
  } catch (err) {
    logger.warn('Transport to Travelling migration skipped', err.message);
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

// Trust proxy (for Railway and other reverse proxies)
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  skip: (req) => process.env.NODE_ENV !== 'production'
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
// EMAIL VERIFICATION HELPER
// ============================================================================

const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
  
  try {
    if (!process.env.RESEND_API_KEY) {
      logger.warn('RESEND_API_KEY not configured, email verification skipped');
      return false;
    }

    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Verify Your Email - Expense Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to Expense Tracker!</h2>
          <p style="color: #333; font-size: 16px;">Please verify your email address to complete your registration.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
          <p style="color: #666; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
          <p style="color: #999; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
        </div>
      `
    });
    
    if (response.error) {
      logger.error('Email sending failed:', { error: response.error, email });
      return false;
    }
    
    logger.info('Verification email sent successfully', { email, messageId: response.id || 'sent' });
    return true;
  } catch (error) {
    logger.error('Email sending failed:', { error: error.message, email });
    return false;
  }
};

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

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with verification fields
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, is_verified, verification_token, verification_token_expires) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, role, is_verified',
      [name, email, hashedPassword, 'user', false, hashedToken, tokenExpires]
    );

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken);

    logger.info('Registration successful', { email, userId: result.rows[0].id });

    res.status(201).json({
      success: true,
      message: emailSent 
        ? 'Registration successful. Please check your email to verify your account.' 
        : 'Registration successful. Please contact support to verify your account.',
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

    // Check if email is verified
    if (!user.is_verified) {
      logger.warn('Login failed: email not verified', { email });
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email first. Check your inbox for the verification link.' 
      });
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

// Verify Email
app.get('/api/auth/verify-email', [
  query('token').notEmpty()
], async (req, res) => {
  const { token } = req.query;

  try {
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Hash the token to match with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by hashed token
    const result = await pool.query(
      'SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()',
      [hashedToken]
    );

    if (result.rows.length === 0) {
      logger.warn('Email verification failed: invalid or expired token');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    const user = result.rows[0];

    // Mark user as verified
    await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL, verification_token_expires = NULL WHERE id = $1',
      [user.id]
    );

    logger.info('Email verified successfully', { email: user.email, userId: user.id });

    res.json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
  } catch (error) {
    logger.error('Email verification error', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// TEST ENDPOINT - Auto-verify user by email (for testing only, remove in production)
app.post('/api/auth/test-verify', [
  body('email').trim().notEmpty().isEmail().normalizeEmail()
], async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    // Mark user as verified
    await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL, verification_token_expires = NULL WHERE id = $1',
      [user.id]
    );

    logger.info('Test: User auto-verified', { email, userId: user.id });

    res.json({
      success: true,
      message: 'User verified successfully for testing'
    });
  } catch (error) {
    logger.error('Test verification error', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DEBUG ENDPOINT - Test Resend email sending
app.post('/api/auth/test-email', [
  body('email').trim().notEmpty().isEmail().normalizeEmail()
], async (req, res) => {
  const { email } = req.body;

  try {
    logger.info('Testing Resend email', { 
      email,
      apiKeyExists: !!process.env.RESEND_API_KEY,
      apiKeyLength: process.env.RESEND_API_KEY?.length || 0
    });

    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Test Email from Expense Tracker',
      html: '<h1>Test Email</h1><p>If you received this, Resend is working!</p>'
    });

    logger.info('Test email sent successfully', { messageId: response.id });

    res.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: response.id
    });
  } catch (error) {
    logger.error('Test email failed:', { 
      error: error.message,
      statusCode: error.statusCode,
      apiKeyExists: !!process.env.RESEND_API_KEY
    });
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: 'Check server logs for more info'
    });
  }
});

// DELETE USER ENDPOINT - For testing/admin purposes (remove in production)
app.post('/api/auth/delete-user', [
  body('email').trim().notEmpty().isEmail().normalizeEmail()
], async (req, res) => {
  const { email } = req.body;

  try {
    logger.info('Attempting to delete user', { email });

    // Find user first
    const findResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (findResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user
    const deleteResult = await pool.query(
      'DELETE FROM users WHERE email = $1 RETURNING id, email, name',
      [email]
    );

    logger.info('User deleted successfully', { email, userId: deleteResult.rows[0].id });

    res.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: deleteResult.rows[0]
    });
  } catch (error) {
    logger.error('Delete user error', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reset Password
app.post('/api/auth/reset-password', [
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('newPassword').notEmpty().isLength({ min: 6 }),
  validate
], async (req, res) => {
  const { email, newPassword } = req.body;
  
  try {
    logger.info('Password reset attempt', { email });

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      logger.warn('Password reset failed: user not found', { email });
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashedPassword, email]
    );

    logger.info('Password reset successful', { email });

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    logger.error('Password reset error', error);
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
      ...result.rows.map(row => {
        const date = new Date(row.date).toISOString().split('T')[0];
        return [date, `"${row.description}"`, row.category, row.amount].join(',');
      })
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  } catch (error) {
    logger.error('Export expenses error', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export expenses with budget summary
app.get('/api/export/expenses-with-budget', [
  authenticate,
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  validate
], async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT * FROM budgets WHERE user_id = $1',
      [req.user.id]
    );

    const expensesResult = await pool.query(
      'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC',
      [req.user.id]
    );

    const userResult2 = await pool.query(
      'SELECT name, email FROM users WHERE id = $1',
      [req.user.id]
    );

    const budget = userResult.rows[0];
    const expenses = expensesResult.rows;
    const user = userResult2.rows[0];

    let csv = 'EXPENSE REPORT\n';
    csv += `Generated: ${new Date().toLocaleString('en-IN')}\n`;
    csv += `User: ${user.name} (${user.email})\n`;
    csv += '\n';

    // Budget summary section
    if (budget && budget.monthly_budget > 0) {
      const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      const remaining = budget.monthly_budget - totalSpent;
      const percentageUsed = (totalSpent / budget.monthly_budget) * 100;

      csv += 'BUDGET SUMMARY\n';
      csv += `Monthly Budget,${parseFloat(budget.monthly_budget).toFixed(2)}\n`;
      csv += `Total Spent,${totalSpent.toFixed(2)}\n`;
      csv += `Remaining,${remaining.toFixed(2)}\n`;
      csv += `Usage,${percentageUsed.toFixed(2)}%\n`;
      csv += '\n';
    }

    // Expenses section
    csv += 'EXPENSES\n';
    csv += ['Date', 'Description', 'Category', 'Amount'].join(',') + '\n';
    expenses.forEach(exp => {
      let date = '';
      if (exp.date) {
        const dateObj = new Date(exp.date);
        date = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
      }
      csv += `${date},"${exp.description}",${exp.category},${parseFloat(exp.amount).toFixed(2)}\n`;
    });

    // Category breakdown
    if (expenses.length > 0) {
      csv += '\n\nCATEGORY BREAKDOWN\n';
      csv += 'Category,Amount,Count\n';

      const categoryBreakdown = {};
      expenses.forEach(exp => {
        if (!categoryBreakdown[exp.category]) {
          categoryBreakdown[exp.category] = { amount: 0, count: 0 };
        }
        categoryBreakdown[exp.category].amount += parseFloat(exp.amount);
        categoryBreakdown[exp.category].count += 1;
      });

      Object.entries(categoryBreakdown).forEach(([cat, data]) => {
        csv += `${cat},${data.amount.toFixed(2)},${data.count}\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expense-report.csv"');
    res.send(csv);
  } catch (error) {
    logger.error('Export expenses with budget error', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export monthly summary
app.get('/api/export/monthly-summary', [
  authenticate
], async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('month', date) as month,
        SUM(amount) as total_amount,
        COUNT(*) as total_count
      FROM expenses
      WHERE user_id = $1
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY month DESC
    `, [req.user.id]);

    let csv = 'MONTHLY EXPENSE SUMMARY\n';
    csv += `Generated: ${new Date().toLocaleString('en-IN')}\n\n`;
    csv += 'Month,Total Expenses,Transaction Count\n';

    let grandTotal = 0;
    let totalTransactions = 0;

    result.rows.forEach(row => {
      const monthName = new Date(row.month).toLocaleString('en-IN', {
        month: 'long',
        year: 'numeric'
      });
      const amount = parseFloat(row.total_amount).toFixed(2);
      csv += `${monthName},${amount},${row.total_count}\n`;
      grandTotal += parseFloat(row.total_amount);
      totalTransactions += parseInt(row.total_count);
    });

    csv += `\nTotal,${grandTotal.toFixed(2)},${totalTransactions}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="monthly-summary.csv"');
    res.send(csv);
  } catch (error) {
    logger.error('Export monthly summary error', error);
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
