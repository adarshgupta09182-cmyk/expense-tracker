import { motion, AnimatePresence } from 'framer-motion';
import './RecurringExpensesList.css';

const RecurringExpensesList = ({ recurringExpenses, onDelete, onEdit }) => {
  const getFrequencyLabel = (frequency, customDays) => {
    if (frequency === 'weekly') return 'Weekly';
    if (frequency === 'monthly') return 'Monthly';
    if (frequency === 'custom') return `Every ${customDays} days`;
    return frequency;
  };

  const getNextDate = (expense) => {
    // Use next_date if set, otherwise calculate from created_at
    const baseDate = expense.next_date
      ? new Date(expense.next_date)
      : new Date(expense.created_at);

    if (isNaN(baseDate.getTime())) return 'Not set';

    const date = new Date(baseDate);
    if (expense.frequency === 'weekly') {
      date.setDate(date.getDate() + 7);
    } else if (expense.frequency === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else if (expense.frequency === 'custom' && expense.customDays) {
      date.setDate(date.getDate() + expense.customDays);
    }
    return date.toLocaleDateString();
  };

  if (recurringExpenses.length === 0) {
    return (
      <div className="recurring-empty">
        <p>No recurring expenses set up yet</p>
      </div>
    );
  }

  return (
    <div className="recurring-expenses-list">
      <h3 className="list-title">Active Recurring Expenses</h3>
      <AnimatePresence mode="popLayout">
        <div className="recurring-cards">
          {recurringExpenses.map((expense) => (
            <motion.div
              key={expense.id}
              className="recurring-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              layout
            >
              <div className="card-top">
                <div className="card-info">
                  <h4 className="card-description">{expense.description}</h4>
                  <div className="card-meta">
                    <span className={`category-badge ${expense.category.toLowerCase()}`}>
                      {expense.category}
                    </span>
                    <span className="frequency-badge">
                      {getFrequencyLabel(expense.frequency, expense.customDays)}
                    </span>
                  </div>
                </div>
                <div className="card-amount">₹{expense.amount.toFixed(2)}</div>
              </div>

              <div className="card-bottom">
                <div className="next-date">
                  Next: {getNextDate(expense)}
                </div>
                <div className="card-actions">
                  <button
                    onClick={() => onEdit?.(expense)}
                    className="btn-small btn-edit"
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => onDelete?.(expense.id)}
                    className="btn-small btn-delete"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default RecurringExpensesList;
