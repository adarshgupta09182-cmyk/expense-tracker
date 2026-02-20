import { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listItemVariants, listContainerVariants } from '../utils/animations';
import EmptyState from './EmptyState';
import './ExpenseTable.css';

const ExpenseTable = ({ expenses, onEdit, onDelete, currentPage, totalPages, onPageChange, totalItems, onAddClick }) => {
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const paginationInfo = useMemo(() => {
    const startItem = (currentPage - 1) * 10 + 1;
    const endItem = Math.min(currentPage * 10, totalItems);
    return { startItem, endItem };
  }, [currentPage, totalItems]);

  const handleEmptyStateClick = useCallback(() => {
    if (onAddClick) {
      onAddClick();
    }
    // Scroll to top where the form is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onAddClick]);

  // Show empty state if no expenses
  if (expenses.length === 0 && totalItems === 0) {
    return (
      <div className="expense-table-container">
        <div className="table-header">
          <h2>Recent Expenses</h2>
        </div>
        <EmptyState onAddClick={handleEmptyStateClick} />
      </div>
    );
  }

  return (
    <div className="expense-table-container">
      <div className="table-header">
        <h2>Recent Expenses</h2>
        <div className="table-info">
          Showing {paginationInfo.startItem}-{paginationInfo.endItem} of {totalItems} expenses
        </div>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {expenses.map((expense) => (
                  <motion.tr
                    key={expense._id}
                    variants={listItemVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout
                  >
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="description-cell">{expense.description}</td>
                    <td>
                      <span className={`category-badge ${expense.category.toLowerCase()}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="amount text-negative">₹{expense.amount.toFixed(2)}</td>
                    <td className="actions">
                      <button onClick={() => onEdit(expense)} className="btn-edit">
                        Edit
                      </button>
                      <button onClick={() => onDelete(expense._id)} className="btn-delete">
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden">
        <AnimatePresence mode="popLayout">
          <div className="expense-cards">
            {expenses.map((expense) => (
              <motion.div
                key={expense._id}
                variants={listItemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
                className="expense-card"
              >
                <div className="card-header">
                  <div className="card-date">
                    {new Date(expense.date).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                  <div className="card-amount">₹{expense.amount.toFixed(2)}</div>
                </div>

                <div className="card-body">
                  <div className="card-description">{expense.description}</div>
                  <div className="card-category">
                    <span className={`category-badge ${expense.category.toLowerCase()}`}>
                      {expense.category}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  <button onClick={() => onEdit(expense)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => onDelete(expense._id)} className="btn-delete">
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseTable;
