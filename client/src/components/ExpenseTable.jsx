import { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listItemVariants, containerVariants } from '../utils/animations';
import './ExpenseTable.css';

const ExpenseTable = ({ expenses, onEdit, onDelete, currentPage, totalPages, onPageChange, totalItems }) => {
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

  return (
    <div className="expense-table-container">
      <div className="table-header">
        <h2>Recent Expenses</h2>
        <div className="table-info">
          Showing {paginationInfo.startItem}-{paginationInfo.endItem} of {totalItems} expenses
        </div>
      </div>
      
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
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">No expenses found</td>
                </tr>
              ) : (
                expenses.map((expense) => (
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
                    <td className="amount">₹{expense.amount.toFixed(2)}</td>
                    <td className="actions">
                      <button onClick={() => onEdit(expense)} className="btn-edit">
                        Edit
                      </button>
                      <button onClick={() => onDelete(expense._id)} className="btn-delete">
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
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
