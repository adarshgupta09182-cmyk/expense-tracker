/**
 * Export Routes
 * Handles data export endpoints (CSV, etc.)
 * @module routes/export
 */

const express = require('express');
const {
  exportExpensesCSV,
  exportExpensesWithBudgetCSV,
  exportMonthlySummaryCSV
} = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

/**
 * @route   GET /api/export/expenses
 * @desc    Export all expenses as CSV
 * @access  Private
 * @query   startDate, endDate, category (optional filters)
 */
router.get('/expenses', exportExpensesCSV);

/**
 * @route   GET /api/export/expenses-with-budget
 * @desc    Export expenses with budget summary as CSV
 * @access  Private
 * @query   startDate, endDate, category (optional filters)
 */
router.get('/expenses-with-budget', exportExpensesWithBudgetCSV);

/**
 * @route   GET /api/export/monthly-summary
 * @desc    Export monthly expense summary as CSV
 * @access  Private
 */
router.get('/monthly-summary', exportMonthlySummaryCSV);

module.exports = router;
