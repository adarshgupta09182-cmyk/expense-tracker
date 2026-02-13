/**
 * Export Controller
 * Handles data export functionality (CSV, etc.)
 * @module controllers/exportController
 */

const Expense = require('../models/Expense');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Generate CSV content from expenses
 * @param {Array} expenses - Array of expense documents
 * @returns {string} CSV formatted string
 */
const generateCSVContent = (expenses) => {
  if (!expenses || expenses.length === 0) {
    return 'Date,Description,Category,Amount\n';
  }

  // CSV headers
  const headers = ['Date', 'Description', 'Category', 'Amount (₹)'];
  const csvRows = [headers.join(',')];

  // Add expense rows
  expenses.forEach(expense => {
    const date = new Date(expense.date).toLocaleDateString('en-IN');
    const description = `"${expense.description.replace(/"/g, '""')}"`;
    const category = expense.category;
    const amount = expense.amount.toFixed(2);

    csvRows.push(`${date},${description},${category},${amount}`);
  });

  // Add summary row
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  csvRows.push('');
  csvRows.push(`Total,,,${totalAmount.toFixed(2)}`);

  return csvRows.join('\n');
};

/**
 * Export all expenses as CSV
 * @route   GET /api/export/expenses
 * @access  Private
 * @desc    Generate and download CSV file of all user expenses
 */
exports.exportExpensesCSV = asyncHandler(async (req, res) => {
  const { startDate, endDate, category } = req.query;

  // Build query filter
  const query = { userId: req.user._id };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (category) {
    query.category = category;
  }

  // Fetch expenses
  const expenses = await Expense.find(query).sort({ date: -1 });

  if (!expenses || expenses.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No expenses found for the specified criteria'
    });
  }

  // Generate CSV content
  const csvContent = generateCSVContent(expenses);

  // Set response headers for file download
  const filename = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Send CSV file
  res.send(csvContent);
});

/**
 * Export expenses with budget summary as CSV
 * @route   GET /api/export/expenses-with-budget
 * @access  Private
 * @desc    Generate CSV with expenses and budget summary
 */
exports.exportExpensesWithBudgetCSV = asyncHandler(async (req, res) => {
  const { startDate, endDate, category } = req.query;

  // Get user budget info
  const user = await User.findById(req.user._id);

  // Build query filter
  const query = { userId: req.user._id };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (category) {
    query.category = category;
  }

  // Fetch expenses
  const expenses = await Expense.find(query).sort({ date: -1 });

  // Generate CSV content
  let csvContent = 'EXPENSE REPORT\n';
  csvContent += `Generated: ${new Date().toLocaleString('en-IN')}\n`;
  csvContent += `User: ${user.name} (${user.email})\n`;
  csvContent += '\n';

  // Budget summary section
  if (user.monthlyBudget > 0) {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = user.monthlyBudget - totalSpent;
    const percentageUsed = (totalSpent / user.monthlyBudget) * 100;

    csvContent += 'BUDGET SUMMARY\n';
    csvContent += `Monthly Budget,₹${user.monthlyBudget.toFixed(2)}\n`;
    csvContent += `Total Spent,₹${totalSpent.toFixed(2)}\n`;
    csvContent += `Remaining,₹${remaining.toFixed(2)}\n`;
    csvContent += `Usage,${percentageUsed.toFixed(2)}%\n`;
    csvContent += '\n';
  }

  // Expenses section
  csvContent += 'EXPENSES\n';
  csvContent += generateCSVContent(expenses);

  // Category breakdown
  if (expenses.length > 0) {
    csvContent += '\n\nCATEGORY BREAKDOWN\n';
    csvContent += 'Category,Amount (₹),Count\n';

    const categoryBreakdown = {};
    expenses.forEach(exp => {
      if (!categoryBreakdown[exp.category]) {
        categoryBreakdown[exp.category] = { amount: 0, count: 0 };
      }
      categoryBreakdown[exp.category].amount += exp.amount;
      categoryBreakdown[exp.category].count += 1;
    });

    Object.entries(categoryBreakdown).forEach(([cat, data]) => {
      csvContent += `${cat},${data.amount.toFixed(2)},${data.count}\n`;
    });
  }

  // Set response headers for file download
  const filename = `expense-report_${new Date().toISOString().split('T')[0]}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Send CSV file
  res.send(csvContent);
});

/**
 * Export monthly summary as CSV
 * @route   GET /api/export/monthly-summary
 * @access  Private
 * @desc    Generate CSV with monthly expense summary
 */
exports.exportMonthlySummaryCSV = asyncHandler(async (req, res) => {
  // Get monthly summary using aggregation
  const summary = await Expense.aggregate([
    {
      $match: { userId: req.user._id }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        totalAmount: { $sum: '$amount' },
        totalCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': -1, '_id.month': -1 }
    }
  ]);

  if (!summary || summary.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No expense data available'
    });
  }

  // Generate CSV content
  let csvContent = 'MONTHLY EXPENSE SUMMARY\n';
  csvContent += `Generated: ${new Date().toLocaleString('en-IN')}\n\n`;
  csvContent += 'Month,Total Expenses (₹),Transaction Count\n';

  summary.forEach(item => {
    const monthName = new Date(item._id.year, item._id.month - 1).toLocaleString('en-IN', {
      month: 'long',
      year: 'numeric'
    });
    csvContent += `${monthName},${item.totalAmount.toFixed(2)},${item.totalCount}\n`;
  });

  // Add total row
  const grandTotal = summary.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalTransactions = summary.reduce((sum, item) => sum + item.totalCount, 0);
  csvContent += `\nTotal,${grandTotal.toFixed(2)},${totalTransactions}`;

  // Set response headers for file download
  const filename = `monthly-summary_${new Date().toISOString().split('T')[0]}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Send CSV file
  res.send(csvContent);
});
