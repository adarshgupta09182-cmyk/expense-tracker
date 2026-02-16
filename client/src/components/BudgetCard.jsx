import { useMemo } from 'react';
import { motion } from 'framer-motion';
import AnimatedCard from './AnimatedCard';
import './BudgetCard.css';

const BudgetCard = ({ budget, totalSpent, isWarning, isExceeded }) => {
  const budgetData = useMemo(() => {
    if (!budget || budget === 0) {
      return {
        remaining: 0,
        percentageUsed: 0,
        status: 'no-budget'
      };
    }

    const remaining = budget - totalSpent;
    const percentageUsed = (totalSpent / budget) * 100;
    
    let status = 'normal';
    if (isExceeded) {
      status = 'exceeded';
    } else if (isWarning) {
      status = 'warning';
    }

    return {
      remaining,
      percentageUsed: Math.min(percentageUsed, 100),
      status
    };
  }, [budget, totalSpent, isWarning, isExceeded]);

  const getStatusColor = () => {
    switch (budgetData.status) {
      case 'exceeded':
        return '#dc3545';
      case 'warning':
        return '#ffc107';
      case 'normal':
        return '#28a745';
      default:
        return '#667eea';
    }
  };

  const getStatusText = () => {
    switch (budgetData.status) {
      case 'exceeded':
        return `Budget Exceeded by ₹${Math.abs(budgetData.remaining).toFixed(2)}`;
      case 'warning':
        return `Warning: ${budgetData.percentageUsed.toFixed(1)}% of budget used`;
      case 'normal':
        return `On Track: ₹${budgetData.remaining.toFixed(2)} remaining`;
      default:
        return 'No budget set';
    }
  };

  if (!budget || budget === 0) {
    return (
      <AnimatedCard className="budget-card no-budget">
        <div className="budget-header">
          <h3>Monthly Budget</h3>
          <span className="budget-status">Not Set</span>
        </div>
        <p className="no-budget-message">Set a monthly budget to track your spending</p>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className={`budget-card ${budgetData.status}`}>
      <div className="budget-header">
        <h3>Monthly Budget</h3>
        <span className={`budget-status ${budgetData.status}`}>
          {budgetData.status === 'exceeded' && '⚠️ Exceeded'}
          {budgetData.status === 'warning' && '⚠️ Warning'}
          {budgetData.status === 'normal' && '✓ On Track'}
        </span>
      </div>

      <div className="budget-amounts">
        <div className="amount-item">
          <span className="label">Budget</span>
          <span className="value">₹{budget.toFixed(2)}</span>
        </div>
        <div className="amount-item">
          <span className="label">Spent</span>
          <span className={`value spent ${budgetData.remaining < 0 ? 'text-negative' : 'text-warning-accent'}`}>₹{totalSpent.toFixed(2)}</span>
        </div>
        <div className="amount-item">
          <span className="label">Remaining</span>
          <span className={`value ${budgetData.remaining < 0 ? 'text-negative' : 'text-positive'}`}>
            ₹{budgetData.remaining.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill"
            style={{
              width: `${budgetData.percentageUsed}%`,
              backgroundColor: getStatusColor()
            }}
          />
        </div>
        <div className="progress-text">
          <span>{budgetData.percentageUsed.toFixed(1)}% used</span>
        </div>
      </div>

      <div className={`status-message ${budgetData.status}`}>
        {getStatusText()}
      </div>
    </AnimatedCard>
  );
};

export default BudgetCard;
