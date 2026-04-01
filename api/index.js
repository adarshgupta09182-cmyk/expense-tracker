const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Pool } = require('pg');
const { Resend } = require('resend');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const resend = new Resend(process.env.RESEND_API_KEY);

const logger = {
  info: (msg, data = {}) => console.log('[INFO] ' + new Date().toISOString() + ' - ' + msg, data),
  error: (msg, err = {}) => console.error('[ERROR] ' + new Date().toISOString() + ' - ' + msg, err.message || err)
};

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const toNum = (r) => ({ ...r, amount: parseFloat(r.amount) });

let dbInitPromise = null;

function initializeDatabase() {
  if (!dbInitPromise) dbInitPromise = _doInitDb();
  return dbInitPromise;
}

// Kick off DB init immediately on cold start so first request doesn't wait
initializeDatabase();

async function _doInitDb() {
  try {
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
      )
    `);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_budget NUMERIC(10,2) DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS budget_warning_threshold INTEGER DEFAULT 80`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        description VARCHAR(500) NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        category VARCHAR(100) DEFAULT 'Other',
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
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
      )
    `);
  } catch (err) {
    logger.error('Database initialization failed', err);
  }
}

async function sendVerificationEmail(email, verificationToken) {
  const verificationUrl = (process.env.FRONTEND_URL || 'https://expense-tracker-rho-brown.vercel.app') + '/verify-email?token=' + verificationToken;
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@expensetracker.com',
    to: [email],
    subject: 'Verify Your Email - Expense Tracker',
    html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><h2 style="color:#4F46E5">Welcome to Expense Tracker!</h2><p>Please verify your email by clicking below:</p><div style="text-align:center;margin:30px 0"><a href="' + verificationUrl + '" style="background:#4F46E5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">Verify Email</a></div><p style="color:#6B7280;font-size:14px">Link expires in 24 hours.</p></div>'
  });
}

async function handleRegister(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ success: false, message: 'User already exists with this email' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const result = await pool.query(
      'INSERT INTO users (name, email, password, verification_token, verification_token_expires) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, is_verified, created_at',
      [name, email, hashedPassword, hashedToken, tokenExpires]
    );
    const user = result.rows[0];

    try { await sendVerificationEmail(email, verificationToken); } catch (e) { logger.error('Email send failed', e); }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: { id: user.id, name: user.name, email: user.email, isVerified: user.is_verified, createdAt: user.created_at }
    });
  } catch (error) {
    logger.error('Registration failed', error);
    if (error.code === '23505') return res.status(400).json({ success: false, message: 'User already exists with this email' });
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}

async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const result = await pool.query('SELECT id, name, email, password, is_verified FROM users WHERE email = $1', [email]);
    if (!result.rows.length) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = generateToken(user.id);

    // Process any overdue recurring expenses in the background
    processRecurringExpenses(user.id).catch(err => logger.error('Recurring processing failed', err));

    res.status(200).json({
      success: true, message: 'Login successful', token,
      user: { id: user.id, name: user.name, email: user.email, isVerified: user.is_verified }
    });
  } catch (error) {
    logger.error('Login failed', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}

async function processRecurringExpenses(userId) {
  const now = new Date();
  const overdue = await pool.query(
    'SELECT * FROM recurring_expenses WHERE user_id = $1 AND is_active = true AND next_date IS NOT NULL AND next_date <= $2',
    [userId, now]
  );

  for (const rec of overdue.rows) {
    let nextDate = new Date(rec.next_date);

    // Insert one expense per missed cycle
    while (nextDate <= now) {
      await pool.query(
        'INSERT INTO expenses (user_id, description, amount, category, date) VALUES ($1, $2, $3, $4, $5)',
        [userId, rec.description, rec.amount, rec.category, nextDate]
      );

      // Advance to next cycle
      if (rec.frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (rec.frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (rec.frequency === 'custom' && rec.custom_days) {
        nextDate.setDate(nextDate.getDate() + parseInt(rec.custom_days));
      } else {
        break; // unknown frequency, stop to avoid infinite loop
      }
    }

    // Update next_date to the next future date
    await pool.query(
      'UPDATE recurring_expenses SET next_date = $1 WHERE id = $2',
      [nextDate, rec.id]
    );
  }
}

async function handleExpenses(req, res, userId) {
  const method = req.method;
  const pathParts = req.url.split('?')[0].split('/').filter(Boolean);
  const segment = pathParts[2] || null;
  const expenseId = segment && segment !== 'summary' ? segment : null;
  const isSummary = segment === 'summary';

  try {
    if (isSummary) {
      const result = await pool.query(
        'SELECT EXTRACT(YEAR FROM date) as year, EXTRACT(MONTH FROM date) as month, category, SUM(amount) as total_amount, COUNT(*) as count FROM expenses WHERE user_id = $1 GROUP BY year, month, category ORDER BY year DESC, month DESC',
        [userId]
      );
      return res.json({ success: true, data: result.rows });
    }

    if (!expenseId) {
      if (method === 'GET') {
        // Process any overdue recurring expenses before returning the list
        processRecurringExpenses(userId).catch(err => logger.error('Recurring processing failed', err));
        const params = new URLSearchParams(req.url.split('?')[1] || '');
        const startDate = params.get('startDate');
        const endDate = params.get('endDate');
        const category = params.get('category');
        let query = 'SELECT * FROM expenses WHERE user_id = $1';
        const values = [userId];
        if (startDate) { values.push(startDate); query += ' AND date >= $' + values.length; }
        if (endDate) { values.push(endDate); query += ' AND date <= $' + values.length; }
        if (category) { values.push(category); query += ' AND category = $' + values.length; }
        query += ' ORDER BY date DESC';
        const result = await pool.query(query, values);
        return res.json({ success: true, count: result.rows.length, data: result.rows.map(toNum) });
      }
      if (method === 'POST') {
        const { description, amount, category, date } = req.body;
        if (!description || !amount) return res.status(400).json({ success: false, message: 'Description and amount are required' });
        const result = await pool.query(
          'INSERT INTO expenses (user_id, description, amount, category, date) VALUES ($1,$2,$3,$4,$5) RETURNING *',
          [userId, description, amount, category || 'Other', date || new Date()]
        );
        return res.status(201).json({ success: true, data: toNum(result.rows[0]) });
      }
    } else {
      if (method === 'GET') {
        const result = await pool.query('SELECT * FROM expenses WHERE id=$1 AND user_id=$2', [expenseId, userId]);
        if (!result.rows.length) return res.status(404).json({ success: false, message: 'Expense not found' });
        return res.json({ success: true, data: toNum(result.rows[0]) });
      }
      if (method === 'PUT') {
        const { description, amount, category, date } = req.body;
        const result = await pool.query(
          'UPDATE expenses SET description=$1, amount=$2, category=$3, date=$4 WHERE id=$5 AND user_id=$6 RETURNING *',
          [description, amount, category, date, expenseId, userId]
        );
        if (!result.rows.length) return res.status(404).json({ success: false, message: 'Expense not found' });
        return res.json({ success: true, data: toNum(result.rows[0]) });
      }
      if (method === 'DELETE') {
        const result = await pool.query('DELETE FROM expenses WHERE id=$1 AND user_id=$2 RETURNING id', [expenseId, userId]);
        if (!result.rows.length) return res.status(404).json({ success: false, message: 'Expense not found' });
        return res.json({ success: true, message: 'Expense deleted' });
      }
    }
    res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    logger.error('Expenses handler failed', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}

async function handleBudget(req, res, userId) {
  try {
    if (req.method === 'GET') {
      const userResult = await pool.query('SELECT monthly_budget, budget_warning_threshold FROM users WHERE id=$1', [userId]);
      if (!userResult.rows.length) return res.status(404).json({ success: false, message: 'User not found' });
      const budget = parseFloat(userResult.rows[0].monthly_budget) || 0;
      const threshold = parseInt(userResult.rows[0].budget_warning_threshold) || 80;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const spentResult = await pool.query(
        'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id=$1 AND date >= $2 AND date <= $3',
        [userId, startOfMonth, endOfMonth]
      );
      const totalSpent = parseFloat(spentResult.rows[0].total) || 0;
      const percentageUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;
      return res.json({
        success: true,
        data: {
          budget,
          totalSpent,
          remaining: budget - totalSpent,
          percentageUsed: Math.round(percentageUsed * 100) / 100,
          isExceeded: totalSpent > budget,
          isWarning: percentageUsed >= threshold && totalSpent <= budget,
          warningThreshold: threshold,
          month: now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
        }
      });
    }
    if (req.method === 'PUT') {
      const { monthlyBudget, budgetWarningThreshold } = req.body;
      if (monthlyBudget === undefined) return res.status(400).json({ success: false, message: 'Monthly budget is required' });
      await pool.query('UPDATE users SET monthly_budget=$1, budget_warning_threshold=$2 WHERE id=$3',
        [monthlyBudget, budgetWarningThreshold || 80, userId]);
      return res.json({ success: true, message: 'Budget updated', data: { monthlyBudget, budgetWarningThreshold } });
    }
    res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    logger.error('Budget handler failed', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}

async function handleRecurring(req, res, userId) {
  const method = req.method;
  const pathParts = req.url.split('?')[0].split('/').filter(Boolean);
  const recurringId = pathParts[2] || null;

  try {
    if (!recurringId) {
      if (method === 'GET') {
        const result = await pool.query('SELECT * FROM recurring_expenses WHERE user_id=$1 ORDER BY created_at DESC', [userId]);
        return res.json({ success: true, count: result.rows.length, data: result.rows.map(toNum) });
      }
      if (method === 'POST') {
        const { description, amount, category, frequency, next_date } = req.body;
        if (!description || !amount) return res.status(400).json({ success: false, message: 'Description and amount are required' });
        const result = await pool.query(
          'INSERT INTO recurring_expenses (user_id, description, amount, category, frequency, next_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
          [userId, description, amount, category || 'Other', frequency || 'monthly', next_date || null]
        );
        return res.status(201).json({ success: true, data: toNum(result.rows[0]) });
      }
    } else {
      if (method === 'PUT') {
        const { description, amount, category, frequency, next_date, is_active } = req.body;
        const result = await pool.query(
          'UPDATE recurring_expenses SET description=$1, amount=$2, category=$3, frequency=$4, next_date=$5, is_active=$6 WHERE id=$7 AND user_id=$8 RETURNING *',
          [description, amount, category, frequency, next_date, is_active !== undefined ? is_active : true, recurringId, userId]
        );
        if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found' });
        return res.json({ success: true, data: toNum(result.rows[0]) });
      }
      if (method === 'DELETE') {
        const result = await pool.query('DELETE FROM recurring_expenses WHERE id=$1 AND user_id=$2 RETURNING id', [recurringId, userId]);
        if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found' });
        return res.json({ success: true, message: 'Deleted' });
      }
    }
    res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    logger.error('Recurring handler failed', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}

async function handleExport(req, res, userId) {
  try {
    const url = req.url;
    const params = new URLSearchParams(url.split('?')[1] || '');
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');
    const category = params.get('category');

    let query = 'SELECT * FROM expenses WHERE user_id = $1';
    const values = [userId];
    if (startDate) { values.push(startDate); query += ' AND date >= $' + values.length; }
    if (endDate) { values.push(endDate); query += ' AND date <= $' + values.length; }
    if (category) { values.push(category); query += ' AND category = $' + values.length; }
    query += ' ORDER BY date DESC';

    const result = await pool.query(query, values);
    const expenses = result.rows.map(toNum);
    const filename = 'expenses_' + new Date().toISOString().split('T')[0] + '.csv';

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Cache-Control', 'no-cache');

    if (url.includes('/export/monthly-summary')) {
      const summaryResult = await pool.query(
        'SELECT EXTRACT(YEAR FROM date) as year, EXTRACT(MONTH FROM date) as month, SUM(amount) as total, COUNT(*) as count FROM expenses WHERE user_id = $1 GROUP BY year, month ORDER BY year DESC, month DESC',
        [userId]
      );
      let csv = 'MONTHLY EXPENSE SUMMARY\n\nMonth,Total (Rs),Transactions\n';
      summaryResult.rows.forEach(function(r) {
        const monthName = new Date(r.year, r.month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
        csv += monthName + ',' + parseFloat(r.total).toFixed(2) + ',' + r.count + '\n';
      });
      return res.send(csv);
    }

    if (url.includes('/export/expenses-with-budget')) {
      const userResult = await pool.query('SELECT name, email, monthly_budget FROM users WHERE id=$1', [userId]);
      const user = userResult.rows[0];
      const budget = parseFloat(user.monthly_budget) || 0;
      const totalSpent = expenses.reduce(function(s, e) { return s + e.amount; }, 0);
      let csv = 'EXPENSE REPORT\nGenerated: ' + new Date().toLocaleString('en-IN') + '\nUser: ' + user.name + ' (' + user.email + ')\n\n';
      if (budget > 0) {
        csv += 'BUDGET SUMMARY\nMonthly Budget,Rs' + budget.toFixed(2) + '\nTotal Spent,Rs' + totalSpent.toFixed(2) + '\nRemaining,Rs' + (budget - totalSpent).toFixed(2) + '\nUsage,' + ((totalSpent / budget) * 100).toFixed(2) + '%\n\n';
      }
      csv += 'EXPENSES\nDate,Description,Category,Amount (Rs)\n';
      expenses.forEach(function(e) {
        csv += new Date(e.date).toLocaleDateString('en-IN') + ',"' + e.description.replace(/"/g, '""') + '",' + e.category + ',' + e.amount.toFixed(2) + '\n';
      });
      return res.send(csv);
    }

    // Default: /export/expenses
    let csv = 'Date,Description,Category,Amount (Rs)\n';
    expenses.forEach(function(e) {
      csv += new Date(e.date).toLocaleDateString('en-IN') + ',"' + e.description.replace(/"/g, '""') + '",' + e.category + ',' + e.amount.toFixed(2) + '\n';
    });
    const total = expenses.reduce(function(s, e) { return s + e.amount; }, 0);
    csv += '\nTotal,,,' + total.toFixed(2);
    return res.send(csv);

  } catch (error) {
    logger.error('Export handler failed', error);
    res.status(500).json({ success: false, message: 'Export failed', error: error.message });
  }
}

const parseBody = function(req) {
  return new Promise(function(resolve) {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let data = '';
    req.on('data', function(chunk) { data += chunk; });
    req.on('end', function() { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { resolve({}); } });
    req.on('error', function() { resolve({}); });
  });
};

const authenticate = function(req, res) {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) { res.status(401).json({ success: false, message: 'No token provided' }); return null; }
  try { return jwt.verify(token, process.env.JWT_SECRET).userId; }
  catch (e) { res.status(401).json({ success: false, message: 'Invalid token' }); return null; }
};

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  req.body = await parseBody(req);

  try {
    const url = req.url || '';
    const method = req.method;
    logger.info('Request', { url: url, method: method });

    if (url === '/' || url.includes('/health')) {
      const dbUrl = process.env.DATABASE_URL;
      return res.status(200).json({
        success: true, message: 'API is running', timestamp: new Date().toISOString(),
        env: {
          hasDbUrl: !!dbUrl,
          dbUrlPrefix: dbUrl ? dbUrl.substring(0, 30) + '...' : 'NOT SET',
          hasJwtSecret: !!process.env.JWT_SECRET,
          hasResendKey: !!process.env.RESEND_API_KEY,
          nodeEnv: process.env.NODE_ENV
        }
      });
    }

    await initializeDatabase();

    if (url.includes('/auth/register') && method === 'POST') return await handleRegister(req, res);
    if (url.includes('/auth/login') && method === 'POST') return await handleLogin(req, res);

    const userId = authenticate(req, res);
    if (!userId) return;

    // NOTE: /export must be checked before /expenses to avoid false match
    if (url.includes('/export')) return await handleExport(req, res, userId);
    if (url.includes('/expenses')) return await handleExpenses(req, res, userId);
    if (url.includes('/budget')) return await handleBudget(req, res, userId);
    if (url.includes('/recurring-expenses')) return await handleRecurring(req, res, userId);

    res.status(404).json({ success: false, message: 'Not found: ' + method + ' ' + url });

  } catch (error) {
    logger.error('Handler failed', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
