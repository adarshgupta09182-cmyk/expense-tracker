import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import axios from '../utils/axios';
import { pageVariants } from '../utils/animations';
import Navbar from '../components/Navbar';
import SummaryCards from '../components/SummaryCards';
import BudgetCard from '../components/BudgetCard';
import BudgetSettings from '../components/BudgetSettings';
import ExportButton from '../components/ExportButton';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseTable from '../components/ExpenseTable';
import ChartsSection from '../components/ChartsSection';
import FilterBar from '../components/FilterBar';
import StatisticsInsights from '../components/StatisticsInsights';
import LoadingSkeleton from '../components/LoadingSkeleton';
import RecurringExpenseForm from '../components/RecurringExpenseForm';
import RecurringExpensesList from '../components/RecurringExpensesList';
import './Dashboard.css';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [budgetData, setBudgetData] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [recurringLoading, setRecurringLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchExpenses();
    fetchBudget();
    fetchRecurringExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, filters]);

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await axios.get('/expenses');
      const data = response.data.data || response.data;
      setExpenses(data);
      setError('');
    } catch (err) {
      setError('Failed to load expenses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBudget = useCallback(async () => {
    try {
      setBudgetLoading(true);
      const response = await axios.get('/budget');
      if (response.data.success) {
        setBudgetData(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load budget:', err);
    } finally {
      setBudgetLoading(false);
    }
  }, []);

  const fetchRecurringExpenses = useCallback(async () => {
    try {
      setRecurringLoading(true);
      const response = await axios.get('/recurring-expenses');
      if (response.data.success) {
        setRecurringExpenses(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load recurring expenses:', err);
    } finally {
      setRecurringLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...expenses];

    if (filters.category) {
      filtered = filtered.filter(e => e.category === filters.category);
    }

    if (filters.startDate) {
      filtered = filtered.filter(e => new Date(e.date) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(e => new Date(e.date) <= new Date(filters.endDate));
    }

    if (filters.search) {
      filtered = filtered.filter(e => 
        e.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredExpenses(filtered);
    setCurrentPage(1);
  }, [expenses, filters]);

  const handleAddExpense = useCallback(async (formData) => {
    try {
      if (editingExpense) {
        await axios.put(`/expenses/${editingExpense._id}`, formData);
        setEditingExpense(null);
      } else {
        await axios.post('/expenses', formData);
      }
      await fetchExpenses();
      await fetchBudget();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense');
    }
  }, [editingExpense, fetchExpenses, fetchBudget]);

  const handleEditExpense = useCallback((expense) => {
    setEditingExpense(expense);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDeleteExpense = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await axios.delete(`/expenses/${id}`);
      await fetchExpenses();
      await fetchBudget();
    } catch (err) {
      setError('Failed to delete expense');
    }
  }, [fetchExpenses, fetchBudget]);

  const handleCancelEdit = useCallback(() => {
    setEditingExpense(null);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      category: '',
      startDate: '',
      endDate: '',
      search: ''
    });
  }, []);

  const handleBudgetUpdate = useCallback(() => {
    fetchBudget();
  }, [fetchBudget]);

  const handleAddRecurringExpense = useCallback(async (formData) => {
    try {
      await axios.post('/recurring-expenses', formData);
      await fetchRecurringExpenses();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create recurring expense');
    }
  }, [fetchRecurringExpenses]);

  const handleDeleteRecurringExpense = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this recurring expense?')) {
      return;
    }

    try {
      await axios.delete(`/recurring-expenses/${id}`);
      await fetchRecurringExpenses();
    } catch (err) {
      setError('Failed to delete recurring expense');
    }
  }, [fetchRecurringExpenses]);

  const handleToggleRecurringExpense = useCallback(async (id, isActive) => {
    try {
      await axios.put(`/recurring-expenses/${id}`, { isActive });
      await fetchRecurringExpenses();
    } catch (err) {
      setError('Failed to update recurring expense');
    }
  }, [fetchRecurringExpenses]);

  // Pagination - memoized to prevent unnecessary recalculations
  const paginationData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentExpenses = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    
    return { currentExpenses, totalPages };
  }, [currentPage, filteredExpenses, itemsPerPage]);

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="dashboard-container">
          <LoadingSkeleton count={5} type="card" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="dashboard"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Navbar />
      <motion.div className="dashboard-container">
        {error && (
          <motion.div
            className="error-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
            <button onClick={() => setError('')} className="error-close">×</button>
          </motion.div>
        )}
        
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="dashboard-actions">
            <ExportButton filters={filters} />
            <BudgetSettings 
              currentBudget={budgetData?.budget}
              currentThreshold={budgetData?.warningThreshold}
              onBudgetUpdate={handleBudgetUpdate}
            />
          </div>
        </div>

        {budgetData && !budgetLoading && (
          <BudgetCard 
            budget={budgetData.budget}
            totalSpent={budgetData.totalSpent}
            isWarning={budgetData.isWarning}
            isExceeded={budgetData.isExceeded}
          />
        )}
        
        <SummaryCards expenses={filteredExpenses} />
        
        <StatisticsInsights expenses={filteredExpenses} budget={budgetData?.budget} />
        
        <ExpenseForm
          onSubmit={handleAddExpense}
          editingExpense={editingExpense}
          onCancel={handleCancelEdit}
        />
        
        <ChartsSection expenses={filteredExpenses} />
        
        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
        
        <ExpenseTable
          expenses={paginationData.currentExpenses}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          currentPage={currentPage}
          totalPages={paginationData.totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredExpenses.length}
        />

        <RecurringExpenseForm 
          onSubmit={handleAddRecurringExpense}
          isLoading={recurringLoading}
        />

        {recurringExpenses.length > 0 && (
          <RecurringExpensesList
            recurringExpenses={recurringExpenses}
            onDelete={handleDeleteRecurringExpense}
            onToggle={handleToggleRecurringExpense}
            isLoading={recurringLoading}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
