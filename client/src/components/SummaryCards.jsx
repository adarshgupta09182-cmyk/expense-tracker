import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { containerVariants, listItemVariants } from '../utils/animations';
import './SummaryCards.css';

const SummaryCards = ({ expenses }) => {
  const summaryData = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const thisMonth = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && 
             expDate.getFullYear() === now.getFullYear();
    });
    const monthlyTotal = thisMonth.reduce((sum, exp) => sum + exp.amount, 0);

    const categories = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

    return {
      totalExpenses,
      monthlyTotal,
      thisMonthCount: thisMonth.length,
      topCategory,
      expensesCount: expenses.length
    };
  }, [expenses]);

  return (
    <motion.div
      className="summary-cards"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div className="summary-card" variants={listItemVariants}>
        <h3>Total Expenses</h3>
        <p className="amount">₹{summaryData.totalExpenses.toFixed(2)}</p>
        <span className="count">{summaryData.expensesCount} transactions</span>
      </motion.div>
      <motion.div className="summary-card" variants={listItemVariants}>
        <h3>This Month</h3>
        <p className="amount">₹{summaryData.monthlyTotal.toFixed(2)}</p>
        <span className="count">{summaryData.thisMonthCount} transactions</span>
      </motion.div>
      <motion.div className="summary-card" variants={listItemVariants}>
        <h3>Top Category</h3>
        <p className="category">{summaryData.topCategory?.[0] || 'N/A'}</p>
        <span className="count">₹{summaryData.topCategory?.[1]?.toFixed(2) || '0.00'}</span>
      </motion.div>
    </motion.div>
  );
};

export default SummaryCards;
