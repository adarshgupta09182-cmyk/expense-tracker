const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
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

// Initialize database tables
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
    
    // Create other tables
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
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recurring_expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        frequency VARCHAR(50) NOT NULL,
        custom_days INTEGER,
        start_date DATE NOT NULL,
        end_date DATE,
        last_generated_date DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    logger.info('✓ Database initialization complete');
  } catch (err) {
    logger.error('Database initialization failed', err);
    throw err;
  }
}

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
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

// Main handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Initialize database on first request
    await initializeDatabase();
    
    // Validate input
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