import { motion, AnimatePresence } from 'framer-motion';
import './RecurringExpensesList.css';

const RecurringExpensesList = ({ recurringExpenses, onDelete, onToggle, isLoading }) => {
  const getFrequencyLabel = (frequency, customDays) => {
    if (frequency === 'weekly') return '📅 Weekly';
    if (frequency === 'monthly') return '📆 Monthly';
    if (frequency === 'custom') return `⚙️ Every ${customDays} days`;
    return frequency;
  };

  const getStatusBadge = (isActive) => {
    return isActive ? '🟢 Active' : '⚫ Inactive';
  };

  if (recurringExpenses.length === 0) {
    return (
      <div className="recurring-empty">
        <p>No recurring expenses yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <motion.div
      className="recurring-expenses-list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3>Your Recurring Expenses</h3>
      <div className="recurring-cards">
        <AnimatePresence mode="popLayout">
          {recurringExpenses.map((expense) => (
            <motion.div
              key={expense.id}
              className="recurring-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              layout
            >
              <div className="card-top">
                <div className="card-info">
                  <h4>{expense.description}</h4>
                  <p className="frequency">{getFrequencyLabel(expense.frequency, expense.custom_days)}</p>
                </div>
                <div className="card-amount">₹{expense.amount.toFixed(2)}</div>
              </div>

              <div className="card-middle">
                <span className={`category-badge ${expense.category.toLowerCase()}`}>
                  {expense.category}
                </span>
                <span className="status-badge">{getStatusBadge(expense.is_active)}</span>
              </div>

              <div className="card-dates">
                <small>Start: {new Date(expense.start_date).toLocaleDateString()}</small>
                {expense.end_date && (
                  <small>End: {new Date(expense.end_date).toLocaleDateString()}</small>
                )}
              </div>

              <div className="card-actions">
                <button
                  onClick={() => onToggle(expense.id, !expense.is_active)}
                  className={`btn-toggle ${expense.is_active ? 'active' : 'inactive'}`}
                  disabled={isLoading}
                >
                  {expense.is_active ? '⏸ Pause' : '▶ Resume'}
                </button>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="btn-delete"
                  disabled={isLoading}
                >
                  🗑 Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RecurringExpensesList;
