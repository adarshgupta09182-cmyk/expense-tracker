const User = require('../models/User');
const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user's budget and current month spending
// @route   GET /api/budget
// @access  Private
exports.getBudget = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get current month expenses
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthlyExpenses = await Expense.aggregate([
    {
      $match: {
        userId: req.user._id,
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      }
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const totalSpent = monthlyExpenses.length > 0 ? monthlyExpenses[0].totalSpent : 0;
  const budget = user.monthlyBudget || 0;
  const remaining = budget - totalSpent;
  const percentageUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;
  const isExceeded = totalSpent > budget;
  const isWarning = percentageUsed >= (user.budgetWarningThreshold || 80) && !isExceeded;

  res.json({
    success: true,
    data: {
      budget,
      totalSpent,
      remaining,
      percentageUsed: Math.round(percentageUsed * 100) / 100,
      isExceeded,
      isWarning,
      warningThreshold: user.budgetWarningThreshold,
      month: now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    }
  });
});

// @desc    Set user's monthly budget
// @route   PUT /api/budget
// @access  Private
exports.setBudget = asyncHandler(async (req, res) => {
  const { monthlyBudget, budgetWarningThreshold } = req.body;

  // Validation
  if (monthlyBudget === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Monthly budget is required'
    });
  }

  if (monthlyBudget < 0) {
    return res.status(400).json({
      success: false,
      message: 'Budget cannot be negative'
    });
  }

  if (budgetWarningThreshold !== undefined) {
    if (budgetWarningThreshold < 0 || budgetWarningThreshold > 100) {
      return res.status(400).json({
        success: false,
        message: 'Warning threshold must be between 0 and 100'
      });
    }
  }

  const updateData = { monthlyBudget };
  if (budgetWarningThreshold !== undefined) {
    updateData.budgetWarningThreshold = budgetWarningThreshold;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'Budget updated successfully',
    data: {
      monthlyBudget: user.monthlyBudget,
      budgetWarningThreshold: user.budgetWarningThreshold
    }
  });
});

// @desc    Get budget history (last 12 months)
// @route   GET /api/budget/history
// @access  Private
exports.getBudgetHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const budget = user.monthlyBudget || 0;
  const history = [];

  // Get last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    const totalSpent = monthlyExpenses.length > 0 ? monthlyExpenses[0].totalSpent : 0;
    const percentageUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;

    history.push({
      month: startOfMonth.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
      budget,
      spent: totalSpent,
      remaining: budget - totalSpent,
      percentageUsed: Math.round(percentageUsed * 100) / 100,
      isExceeded: totalSpent > budget
    });
  }

  res.json({
    success: true,
    count: history.length,
    data: history
  });
});
