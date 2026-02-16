import { useMemo } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import './ChartsSection.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartsSection = ({ expenses }) => {
  // Get theme colors from CSS variables
  const getThemeColors = () => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    return {
      textPrimary: computedStyle.getPropertyValue('--text-primary').trim(),
      textSecondary: computedStyle.getPropertyValue('--text-secondary').trim(),
      primary: computedStyle.getPropertyValue('--primary').trim(),
      success: computedStyle.getPropertyValue('--success').trim(),
      warning: computedStyle.getPropertyValue('--warning').trim(),
      error: computedStyle.getPropertyValue('--error').trim(),
      bgDefault: computedStyle.getPropertyValue('--bg-default').trim(),
    };
  };

  const chartData = useMemo(() => {
    const colors = getThemeColors();
    
    // Category data for pie chart
    const categoryData = Object.entries(
      expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {})
    );

    // Chart color palette - matches light mode design system
    const chartColors = [
      '#4F46E5', // Indigo
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#3B82F6', // Blue
      '#6B7280'  // Grey
    ];

    const pieColors = chartColors;

    const pieData = {
      labels: categoryData.map(([name]) => name),
      datasets: [
        {
          label: 'Expenses by Category',
          data: categoryData.map(([, value]) => value),
          backgroundColor: pieColors.map(color => color + 'CC'),
          borderColor: pieColors,
          borderWidth: 2,
        },
      ],
    };

    // Monthly data for bar chart
    const monthlyData = expenses.reduce((acc, exp) => {
      const month = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.amount += exp.amount;
      } else {
        acc.push({ month, amount: exp.amount });
      }
      return acc;
    }, []).sort((a, b) => new Date(a.month) - new Date(b.month));

    const barData = {
      labels: monthlyData.map(d => d.month),
      datasets: [
        {
          label: 'Monthly Expenses (₹)',
          data: monthlyData.map(d => d.amount),
          backgroundColor: '#4F46E5CC',
          borderColor: '#4F46E5',
          borderWidth: 2,
        },
      ],
    };

    return { pieData, barData };
  }, [expenses]);

  const barOptions = useMemo(() => {
    const colors = getThemeColors();
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: colors.textPrimary,
            font: {
              family: "'Inter', sans-serif",
              size: 14,
            },
          },
        },
        title: {
          display: false,
        },
        filler: {
          propagate: true,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: colors.textSecondary,
            callback: function(value) {
              return '₹' + value.toLocaleString();
            }
          },
          grid: {
            color: colors.bgDefault === '#FFFFFF' ? '#E5E7EB' : 'rgba(255, 255, 255, 0.1)',
          }
        },
        x: {
          ticks: {
            color: colors.textSecondary,
          },
          grid: {
            display: false,
          }
        }
      }
    };
  }, []);

  const pieOptions = useMemo(() => {
    const colors = getThemeColors();
    const isDarkMode = colors.bgDefault !== '#FFFFFF';
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: isDarkMode ? colors.textPrimary : '#111827',
            font: {
              family: "'Inter', sans-serif",
              size: 14,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      },
    };
  }, []);

  if (expenses.length === 0) {
    return (
      <div className="charts-section">
        <div className="no-data-message">
          <p>No expense data available. Add some expenses to see charts!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-section">
      <div className="chart-container">
        <h3>Monthly Expenses</h3>
        <div className="chart-wrapper">
          <Bar data={chartData.barData} options={barOptions} />
        </div>
      </div>

      <div className="chart-container">
        <h3>Category Breakdown</h3>
        <div className="chart-wrapper">
          <Pie data={chartData.pieData} options={pieOptions} />
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
