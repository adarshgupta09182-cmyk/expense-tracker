import { useMemo } from 'react';
import './StatisticsInsights.css';

const StatisticsInsights = ({ expenses, budget }) => {
  const insights = useMemo(() => {
    if (expenses.length === 0) {
      return null;
    }

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avgExpense = totalExpenses / expenses.length;
    
    // Category analysis
    const categoryData = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    
    const topCategory = Object.entries(categoryData).sort((a, b) => b[1] - a[1])[0];
    const lowestCategory = Object.entries(categoryData).sort((a, b) => a[1] - b[1])[0];

    // Trend analysis
    const last7Days = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return expDate >= sevenDaysAgo;
    });
    const last7DaysTotal = last7Days.reduce((sum, exp) => sum + exp.amount, 0);
    const dailyAverage = last7DaysTotal / 7;

    // Monthly trend
    const thisMonth = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && 
             expDate.getFullYear() === now.getFullYear();
    });
    const thisMonthTotal = thisMonth.reduce((sum, exp) => sum + exp.amount, 0);

    // Budget projection
    let projectedMonthlySpend = thisMonthTotal;
    if (thisMonth.length > 0) {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const currentDay = new Date().getDate();
      projectedMonthlySpend = (thisMonthTotal / currentDay) * daysInMonth;
    }

    // Spending velocity
    const spendingVelocity = dailyAverage > 0 ? ((dailyAverage - avgExpense) / avgExpense * 100).toFixed(1) : 0;

    return {
      totalExpenses: totalExpenses.toFixed(2),
      avgExpense: avgExpense.toFixed(2),
      topCategory: topCategory?.[0],
      topCategoryAmount: topCategory?.[1]?.toFixed(2),
      lowestCategory: lowestCategory?.[0],
      lowestCategoryAmount: lowestCategory?.[1]?.toFixed(2),
      last7DaysTotal: last7DaysTotal.toFixed(2),
      dailyAverage: dailyAverage.toFixed(2),
      thisMonthTotal: thisMonthTotal.toFixed(2),
      projectedMonthlySpend: projectedMonthlySpend.toFixed(2),
      spendingVelocity,
      expenseCount: expenses.length,
      last7DaysCount: last7Days.length,
      thisMonthCount: thisMonth.length
    };
  }, [expenses]);

  if (!insights) {
    return null;
  }

  const getBudgetStatus = () => {
    if (!budget || budget === 0) return null;
    const spent = parseFloat(insights.thisMonthTotal);
    const remaining = budget - spent;
    const percentage = (spent / budget * 100).toFixed(1);
    
    if (percentage > 100) {
      return { status: 'exceeded', message: `Exceeded by ₹${Math.abs(remaining).toFixed(2)}`, color: '#dc3545' };
    } else if (percentage > 80) {
      return { status: 'warning', message: `${percentage}% of budget used`, color: '#ffc107' };
    }
    return { status: 'safe', message: `${percentage}% of budget used`, color: '#28a745' };
  };

  const budgetStatus = getBudgetStatus();

  return (
    <div className="statistics-insights fade-in">
      <h2>📊 Spending Insights</h2>
      
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-header">
            <span className="insight-label">Average Expense</span>
            <span className="insight-icon">📈</span>
          </div>
          <p className="insight-value text-negative">₹{insights.avgExpense}</p>
          <p className="insight-detail">Per transaction</p>
        </div>

        <div className="insight-card">
          <div className="insight-header">
            <span className="insight-label">Daily Average</span>
            <span className="insight-icon">📅</span>
          </div>
          <p className="insight-value text-negative">₹{insights.dailyAverage}</p>
          <p className="insight-detail">Last 7 days</p>
        </div>

        <div className="insight-card">
          <div className="insight-header">
            <span className="insight-label">Top Category</span>
            <span className="insight-icon">🎯</span>
          </div>
          <p className="insight-value">{insights.topCategory}</p>
          <p className="insight-detail text-negative">₹{insights.topCategoryAmount}</p>
        </div>

        <div className="insight-card">
          <div className="insight-header">
            <span className="insight-label">This Month</span>
            <span className="insight-icon">📆</span>
          </div>
          <p className="insight-value text-negative">₹{insights.thisMonthTotal}</p>
          <p className="insight-detail">{insights.thisMonthCount} transactions</p>
        </div>

        {budgetStatus && (
          <div className="insight-card budget-card">
            <div className="insight-header">
              <span className="insight-label">Budget Status</span>
              <span className="insight-icon">💰</span>
            </div>
            <p className="insight-value" style={{ color: budgetStatus.color }}>
              {budgetStatus.message}
            </p>
            <p className="insight-detail">Projected: ₹{insights.projectedMonthlySpend}</p>
          </div>
        )}

        <div className="insight-card">
          <div className="insight-header">
            <span className="insight-label">Spending Trend</span>
            <span className="insight-icon">📊</span>
          </div>
          <p className="insight-value" style={{ color: insights.spendingVelocity > 0 ? '#dc3545' : '#28a745' }}>
            {insights.spendingVelocity > 0 ? '↑' : '↓'} {Math.abs(insights.spendingVelocity)}%
          </p>
          <p className="insight-detail">vs average</p>
        </div>
      </div>

      <div className="insights-summary">
        <div className="summary-item">
          <span className="summary-label">Total Transactions:</span>
          <span className="summary-value">{insights.expenseCount}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Last 7 Days:</span>
          <span className="summary-value text-negative">₹{insights.last7DaysTotal}</span>
          <span className="summary-detail">({insights.last7DaysCount} txns)</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Highest Category:</span>
          <span className="summary-value">{insights.topCategory}</span>
          <span className="summary-detail text-negative">(₹{insights.topCategoryAmount})</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Lowest Category:</span>
          <span className="summary-value">{insights.lowestCategory}</span>
          <span className="summary-detail text-positive">(₹{insights.lowestCategoryAmount})</span>
        </div>
      </div>
    </div>
  );
};

export default StatisticsInsights;
