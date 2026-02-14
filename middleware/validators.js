const { body, param, query, validationResult } = require('express-validator');

// Validation result checker
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

// Auth validators
exports.registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
  validate
];

exports.loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
  validate
];

// Expense validators
exports.createExpenseValidator = [
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 3, max: 200 }).withMessage('Description must be between 3 and 200 characters')
    .escape(),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other'])
    .withMessage('Invalid category'),
  body('date')
    .optional()
    .isISO8601().withMessage('Invalid date format')
    .toDate(),
  validate
];

exports.updateExpenseValidator = [
  param('id')
    .isMongoId().withMessage('Invalid expense ID'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Description must be between 3 and 200 characters')
    .escape(),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('category')
    .optional()
    .isIn(['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other'])
    .withMessage('Invalid category'),
  body('date')
    .optional()
    .isISO8601().withMessage('Invalid date format')
    .toDate(),
  validate
];

exports.expenseIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid expense ID'),
  validate
];

exports.expenseQueryValidator = [
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format')
    .toDate(),
  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format')
    .toDate(),
  query('category')
    .optional()
    .isIn(['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other'])
    .withMessage('Invalid category'),
  validate
];
