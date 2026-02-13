const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all expenses for logged-in user with filtering
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = asyncHandler(async (req, res) => {
  const { startDate, endDate, category } = req.query;
  
  const query = { userId: req.user._id };
  
  // Date range filter
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  // Category filter
  if (category) {
    query.category = category;
  }
  
  const expenses = await Expense.find(query).sort({ date: -1 });
  
  res.json({
    success: true,
    count: expenses.length,
    data: expenses
  });
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({
    _id: req.params.id,
    userId: req.user._id
  });
  
  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }
  
  res.json({
    success: true,
    data: expense
  });
});

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = asyncHandler(async (req, res) => {
  const { description, amount, category, date } = req.body;
  
  const expense = await Expense.create({
    userId: req.user._id,
    description,
    amount,
    category,
    date: date || new Date()
  });
  
  res.status(201).json({
    success: true,
    data: expense
  });
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = asyncHandler(async (req, res) => {
  const { description, amount, category, date } = req.body;
  
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { description, amount, category, date },
    { new: true, runValidators: true }
  );
  
  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }
  
  res.json({
    success: true,
    data: expense
  });
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });
  
  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Expense deleted'
  });
});

// @desc    Get monthly summary aggregation
// @route   GET /api/expenses/summary/monthly
// @access  Private
exports.getMonthlySummary = asyncHandler(async (req, res) => {
  const summary = await Expense.aggregate([
    {
      $match: { userId: req.user._id }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          category: '$category'
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: {
          year: '$_id.year',
          month: '$_id.month'
        },
        totalAmount: { $sum: '$totalAmount' },
        totalCount: { $sum: '$count' },
        byCategory: {
          $push: {
            category: '$_id.category',
            amount: '$totalAmount',
            count: '$count'
          }
        }
      }
    },
    {
      $sort: { '_id.year': -1, '_id.month': -1 }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        totalAmount: 1,
        totalCount: 1,
        byCategory: 1
      }
    }
  ]);
  
  res.json({
    success: true,
    count: summary.length,
    data: summary
  });
});
