const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Pool } = require('pg');
const { Resend } = require('resend');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Logger utility
const logger = {
  info: (msg, data = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data);
  },
  error: (msg, err = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err.message || err);
  }
};

// Generate token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Send verification email
const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'https://expense-tracker-rho-brown.vercel.app'}/verify-email?token=${verificationToken}`;
    
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@expensetracker.com',
      to: [email],
      subject: 'Verify Your Email - Expense Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to Expense Tracker!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #6B7280;">${verificationUrl}</p>
          <p style="color: #6B7280; font-size: 14px;">This link will expire in 24 hours.</p>
        </div>
      `
    });

    if (error) {
      logger.error('Failed to send verification email', error);
      throw error;
    }

    logger.info('Verification email sent successfully', { email, messageId: data?.id });
    return data;
  } catch (error) {
    logger.error('Error sending verification email', error);
    throw error;
  }
};

// Initialize database tables
async function initializeDatabase() {
  try {
    logger.info('Initializing PostgreSQL database...');
    
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
        monthly_budget NUMERIC(10,2) DEFAULT 0,
        budget_warning_threshold INTEGER DEFAULT 80,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        description VARCHAR(500) NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        category VARCHAR(100) DEFAULT 'Other',
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS recurring_expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        description VARCHAR(500) NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        category VARCHAR(100) DEFAULT 'Other',
        frequency VARCHAR(50) DEFAULT 'monthly',
        next_date TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    logger.info('✓ Database initialization complete');
  } catch (err) {
    logger.error('Database initialization failed', err);
  }
}

// Handle registration
async function handleRegister(req, res) {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Create user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, verification_token, verification_token_expires) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, is_verified, created_at`,
      [name, email, hashedPassword, hashedToken, tokenExpires]
    );
    
    const user = result.rows[0];
    
    // Send verification email (don't block registration if this fails)
    try {
      await sendVerificationEmail(email, verificationToken);
      logger.info('Verification email sent', { userId: user.id, email });
    } catch (emailError) {
      logger.error('Failed to send verification email, but user created', emailError);
    }
    
    logger.info('User registered successfully', { userId: user.id, email });
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.is_verified,
        createdAt: user.created_at
      }
    });
    
  } catch (error) {
    logger.error('Registration failed', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Handle login
async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user
    const result = await pool.query(
      'SELECT id, name, email, password, is_verified FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const user = result.rows[0];
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    logger.info('User logged in successfully', { userId: user.id, email });
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.is_verified
      }
    });
    
  } catch (error) {
    logger.error('Login failed', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Parse request body
const parseBody = (req) => {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
};

// Auth middleware
const authenticate = (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return null;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return null;
  }
};

// Handle expenses
async function handleExpenses(req, res, userId) {
  const method = req.method;
  const urlParts = req.url.split('?')[0].split('/').filter(Boolean);
  // urlParts: ['api', 'expenses'] or ['api', 'expenses', 'summary', 'monthly'] or ['api', 'expenses', ':id']
  const expenseId = urlParts[2] && urlParts[2] !== 'summary' ? urlParts[2] : null;
  const isSummary = urlParts[2] === 'summary';

  if (isSummary && method === 'GET') {
    const result = await pool.query(`
      SELECT 
        EXTRACT(YEAR FROM date) as year,
        EXTRACT(MONTH FROM date) as month,
        category,
        SUM(amount) as total_amount,
        COUNT(*) as count
      FROM expenses WHERE user_id = $1
      GROUP BY year, month, category
      ORDER BY year DESC, month DESC
    `, [userId]);
    return res.json({ success: true, data: result.rows });
  }

  if (!expenseId) {
    if (method === 'GET') {
      const { startDate, endDate, category } = Object.fromEntries(
        new URLSearchParams(req.url.split('?')[1] || '')
      );
      let query = 'SELECT * FROM expenses WHERE user_id = $1';
      const params = [userId];
      if (startDate) { params.push(startDate); query += ` AND date >= $${params.length}`; }
      if (endDate) { params.push(endDate); query += ` AND date <= $${params.length}`; }
      if (category) { params.push(category); query += ` AND category = $${params.length}`; }
      query += ' ORDER BY date DESC';
      const result = await pool.query(query, params);
      return res.json({ success: true, count: result.rows.length, data: result.rows });
    }
    if (method === 'POST') {
      const { description, amount, category, date } = req.body;
      if (!description || !amount) return res.status(400).json({ success: false, message: 'Description and amount are required' });
      const result = await pool.query(
        'INSERT INTO expenses (user_id, description, amount, category, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, description, amount, category || 'Other', date || new Date()]
      );
      return res.status(201).json({ success: true, data: result.rows[0] });
    }
  } else {
    if (method === 'GET') {
      const result = await pool.query('SELECT * FROM expenses WHERE id = $1 AND user_id = $2', [expenseId, userId]);
      if (!result.rows.length) return res.status(404).json({ success: false, message: 'Expense not found' });
      return res.json({ success: true, data: result.rows[0] });
    }
    if (method === 'PUT') {
      const { description, amount, category, date } = req.body;
      const result = await pool.query(
        'UPDATE expenses SET description=$1, amount=$2, category=$3, date=$4 WHERE id=$5 AND user_id=$6 RETURNING *',
        [description, amount, category, date, expenseId, userId]
      );
      if (!result.rows.length) return res.status(404).json({ success: false, message: 'Expense not found' });
      return res.json({ success: true, data: result.rows[0] });
    }
    if (method === 'DELETE') {
      const result = await pool.query('DELETE FROM expenses WHERE id=$1 AND user_id=$2 RETURNING id', [expenseId, userId]);
      if (!result.rows.length) return res.status(404).json({ success: false, message: 'Expense not found' });
      return res.json({ success: true, message: 'Expense deleted' });
    }
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

// Handle budget
async function handleBudget(req, res, userId) {
  const method = req.method;
  if (method === 'GET') {
    const userResult = await pool.query('SELECT monthly_budget, budget_warning_threshold FROM users WHERE id = $1', [userId]);
    if (!userResult.rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    const { monthly_budget: budget, budget_warning_threshold: threshold } = userResult.rows[0];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const spentResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id=$1 AND date >= $2 AND date <= $3',
      [userId, startOfMonth, endOfMonth]
    );
    const totalSpent = parseFloat(spentResult.rows[0].total);
    const percentageUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;
    return res.json({
      success: true,
      data: {
        budget: parseFloat(budget),
        totalSpent,
        remaining: parseFloat(budget) - totalSpent,
        percentageUsed: Math.round(percentageUsed * 100) / 100,
        isExceeded: totalSpent > budget,
        isWarning: percentageUsed >= threshold && totalSpent <= budget,
        warningThreshold: threshold,
        month: now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      }
    });
  }
  if (method === 'PUT') {
    const { monthlyBudget, budgetWarningThreshold } = req.body;
    if (monthlyBudget === undefined) return res.status(400).json({ success: false, message: 'Monthly budget is required' });
    await pool.query(
      'UPDATE users SET monthly_budget=$1, budget_warning_threshold=$2 WHERE id=$3',
      [monthlyBudget, budgetWarningThreshold || 80, userId]
    );
    return res.json({ success: true, message: 'Budget updated', data: { monthlyBudget, budgetWarningThreshold } });
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

// Handle recurring expenses
async function handleRecurring(req, res, userId) {
  const method = req.method;
  const urlParts = req.url.split('?')[0].split('/').filter(Boolean);
  const recurringId = urlParts[2] || null;

  if (!recurringId) {
    if (method === 'GET') {
      const result = await pool.query('SELECT * FROM recurring_expenses WHERE user_id=$1 ORDER BY created_at DESC', [userId]);
      return res.json({ success: true, count: result.rows.length, data: result.rows });
    }
    if (method === 'POST') {
      const { description, amount, category, frequency, next_date } = req.body;
      if (!description || !amount) return res.status(400).json({ success: false, message: 'Description and amount are required' });
      const result = await pool.query(
        'INSERT INTO recurring_expenses (user_id, description, amount, category, frequency, next_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
        [userId, description, amount, category || 'Other', frequency || 'monthly', next_date || null]
      );
      return res.status(201).json({ success: true, data: result.rows[0] });
    }
  } else {
    if (method === 'PUT') {
      const { description, amount, category, frequency, next_date, is_active } = req.body;
      const result = await pool.query(
        'UPDATE recurring_expenses SET description=$1, amount=$2, category=$3, frequency=$4, next_date=$5, is_active=$6 WHERE id=$7 AND user_id=$8 RETURNING *',
        [description, amount, category, frequency, next_date, is_active, recurringId, userId]
      );
      if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found' });
      return res.json({ success: true, data: result.rows[0] });
    }
    if (method === 'DELETE') {
      const result = await pool.query('DELETE FROM recurring_expenses WHERE id=$1 AND user_id=$2 RETURNING id', [recurringId, userId]);
      if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found' });
      return res.json({ success: true, message: 'Deleted' });
    }
  }
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

// Main handler
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse body
  req.body = await parseBody(req);

  try {
    // Parse URL and method
    const url = req.url || '';
    const method = req.method;
    
    logger.info('API Request received', { url, method, body: req.body, timestamp: new Date().toISOString() });
    
    // Health check endpoint (no database required)
    if (url === '/' || url === '/health' || url.includes('/health')) {
      const dbUrl = process.env.DATABASE_URL;
      return res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        url,
        method,
        version: '1.0.0',
        env: {
          hasDbUrl: !!dbUrl,
          dbUrlPrefix: dbUrl ? dbUrl.substring(0, 30) + '...' : 'NOT SET',
          hasJwtSecret: !!process.env.JWT_SECRET,
          hasResendKey: !!process.env.RESEND_API_KEY,
          nodeEnv: process.env.NODE_ENV
        }
      });
    }
    
    // Initialize database for all routes
    await initializeDatabase();

    // Route handling
    if (url.includes('/auth/register') && method === 'POST') {
      return await handleRegister(req, res);
    }
    
    if (url.includes('/auth/login') && method === 'POST') {
      return await handleLogin(req, res);
    }

    // Protected routes - require auth
    const userId = authenticate(req, res);
    if (!userId) return;

    if (url.includes('/expenses')) {
      return await handleExpenses(req, res, userId);
    }

    if (url.includes('/budget')) {
      return await handleBudget(req, res, userId);
    }

    if (url.includes('/recurring-expenses')) {
      return await handleRecurring(req, res, userId);
    }
    
    // Default response for unmatched routes
    logger.info('Unmatched route', { url, method });
    res.status(404).json({
      success: false,
      message: `Endpoint not found: ${method} ${url}`,
      availableEndpoints: [
        'GET /api/health',
        'POST /api/auth/register',
        'POST /api/auth/login'
      ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('API handler failed', error);
    console.error('Full error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};