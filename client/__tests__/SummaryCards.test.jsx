import { render, screen } from '@testing-library/react';
import SummaryCards from '../src/components/SummaryCards';

describe('SummaryCards Component', () => {
  const mockExpenses = [
    {
      _id: '1',
      description: 'Lunch',
      amount: 500,
      category: 'Food',
      date: new Date().toISOString()
    },
    {
      _id: '2',
      description: 'Taxi',
      amount: 200,
      category: 'Transport',
      date: new Date().toISOString()
    },
    {
      _id: '3',
      description: 'Movie',
      amount: 300,
      category: 'Entertainment',
      date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()
    }
  ];

  test('renders summary cards', () => {
    render(<SummaryCards expenses={mockExpenses} />);
    
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('Top Category')).toBeInTheDocument();
  });

  test('calculates total expenses correctly', () => {
    render(<SummaryCards expenses={mockExpenses} />);
    
    const totalAmount = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    expect(screen.getByText(`₹${totalAmount.toFixed(2)}`)).toBeInTheDocument();
  });

  test('displays correct transaction count', () => {
    render(<SummaryCards expenses={mockExpenses} />);
    
    expect(screen.getByText(`${mockExpenses.length} transactions`)).toBeInTheDocument();
  });

  test('identifies top category correctly', () => {
    render(<SummaryCards expenses={mockExpenses} />);
    
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  test('handles empty expenses array', () => {
    render(<SummaryCards expenses={[]} />);
    
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('₹0.00')).toBeInTheDocument();
  });
});
