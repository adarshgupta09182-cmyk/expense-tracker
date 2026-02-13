const express = require('express');
const {
  getBudget,
  setBudget,
  getBudgetHistory
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getBudget)
  .put(setBudget);

router.get('/history', getBudgetHistory);

module.exports = router;
