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
  const chartData = useMemo(() => {
    // Category data for pie chart
    const categoryData = Object.entries(
      expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {})
    );

    const pieData = {
      labels: categoryData.map(([name]) => name),
      datasets: [
        {
          label: 'Expenses by Category',
          data: categoryData.map(([, value]) => value),
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(240, 147, 251, 0.8)',
            'rgba(79, 172, 254, 0.8)',
            'rgba(67, 233, 123, 0.8)',
          ],
          borderColor: [
            'rgba(102, 126, 234, 1)',
            'rgba(118, 75, 162, 1)',
            'rgba(240, 147, 251, 1)',
            'rgba(79, 172, 254, 1)',
            'rgba(67, 233, 123, 1)',
          ],
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
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2,
        },
      ],
    };

    return { pieData, barData };
  }, [expenses]);

  const barOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  }), []);

  const pieOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
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
  }), []);

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
