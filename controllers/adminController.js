const User = require('../models/User');
const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboard = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  const expenses = await Expense.find().populate('userId', 'name email');
  
  res.json({
    success: true,
    data: {
      users,
      expenses
    }
  });
});
