/**
 * Expense Tracker Server (MongoDB Mode)
 * Main application entry point with Express, MongoDB, and security middleware
 * @module server-mongodb
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// DATABASE CONNECTION
// ============================================================================
connectDB();

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Helmet - Set security HTTP headers
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

// CORS - Cross-Origin Resource Sharing
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Rate Limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ============================================================================
// BODY PARSER & DATA SANITIZATION
// ============================================================================

// Parse JSON and URL-encoded request bodies
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// ============================================================================
// STATIC FILES & DOCUMENTATION
// ============================================================================

// Serve static files from public directory
app.use(express.static('public'));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true,
  }
}));

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'Server is running with MongoDB',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

// Authentication routes
app.use('/api/auth', require('./routes/auth'));

// Expense routes
app.use('/api/expenses', require('./routes/expenses'));

// Budget routes
app.use('/api/budget', require('./routes/budget'));

// Export routes
app.use('/api/export', require('./routes/export'));

// Admin routes
app.use('/api/admin', require('./routes/admin'));

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const server = app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         Expense Tracker Server Started                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📍 Server URL: http://localhost:${PORT}`);
  console.log(`📚 API Docs:   http://localhost:${PORT}/api-docs`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database:   MongoDB\n`);
});

// ============================================================================
// ERROR HANDLING - UNHANDLED REJECTIONS & EXCEPTIONS
// ============================================================================

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('\n❌ UNHANDLED REJECTION! Shutting down...');
  console.error(`Error: ${err.name} - ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('\n❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(`Error: ${err.name} - ${err.message}`);
  process.exit(1);
});

module.exports = app;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = app;

