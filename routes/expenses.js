const express = require('express');
const {
  createExpenseValidator,
  updateExpenseValidator,
  expenseIdValidator,
  expenseQueryValidator
} = require('../middleware/validators');
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlySummary
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(expenseQueryValidator, getExpenses)
  .post(createExpenseValidator, createExpense);

router.get('/summary/monthly', getMonthlySummary);

router.route('/:id')
  .get(expenseIdValidator, getExpense)
  .put(updateExpenseValidator, updateExpense)
  .delete(expenseIdValidator, deleteExpense);

module.exports = router;
