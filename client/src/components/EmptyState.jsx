import { motion } from 'framer-motion';
import './EmptyState.css';

const EmptyState = ({ onAddClick }) => {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="empty-state-content">
        {/* Illustration */}
        <div className="empty-state-illustration">
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="illustration-svg"
          >
            {/* Wallet/Money Bag */}
            <circle cx="100" cy="100" r="90" fill="currentColor" opacity="0.1" />
            <path
              d="M70 80C70 70 78 60 90 60H110C122 60 130 70 130 80V140C130 150 122 160 110 160H90C78 160 70 150 70 140V80Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="100" cy="110" r="12" stroke="currentColor" strokeWidth="2.5" />
            <path
              d="M100 105V115M95 110H105"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Coins */}
            <circle cx="60" cy="130" r="8" stroke="currentColor" strokeWidth="2" opacity="0.6" />
            <circle cx="140" cy="125" r="8" stroke="currentColor" strokeWidth="2" opacity="0.6" />
          </svg>
        </div>

        {/* Text Content */}
        <h3 className="empty-state-title">No expenses yet</h3>
        <p className="empty-state-description">
          Start tracking your spending by adding your first expense
        </p>

        {/* CTA Button */}
        <motion.button
          onClick={onAddClick}
          className="empty-state-cta"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="cta-icon">+</span>
          Add your first expense
        </motion.button>

        {/* Helpful Tip */}
        <div className="empty-state-tip">
          💡 Tip: Track all your expenses to see spending patterns and manage your budget better
        </div>
      </div>
    </motion.div>
  );
};

export default EmptyState;
