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
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [filters, setFilters] = useState({ category: '', startDate: '', endDate: '', search: '' });
  const itemsPerPage = 10;

  // Fetch all data in parallel on mount
  useEffect(() => {
    Promise.all([
      axios.get('/expenses'),
      axios.get('/budget'),
      axios.get('/recurring-expenses')
    ]).then(([expRes, budgetRes, recurringRes]) => {
      setExpenses(expRes.data.data || expRes.data);
      if (budgetRes.data.success) setBudgetData(budgetRes.data.data);
      if (recurringRes.data.success) setRecurringExpenses(recurringRes.data.data);
    }).catch((err) => {
      setError('Failed to load data');
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let filtered = [...expenses];
    if (filters.category) filtered = filtered.filter(e => e.category === filters.category);
    if (filters.startDate) filtered = filtered.filter(e => new Date(e.date) >= new Date(filters.startDate));
    if (filters.endDate) filtered = filtered.filter(e => new Date(e.date) <= new Date(filters.endDate));
    if (filters.search) filtered = filtered.filter(e => e.description.toLowerCase().includes(filters.search.toLowerCase()));
    setFilteredExpenses(filtered);
    setCurrentPage(1);
  }, [expenses, filters]);

  const refreshBudget = useCallback(() => {
    axios.get('/budget').then(r => { if (r.data.success) setBudgetData(r.data.data); }).catch(() => {});
  }, []);

  const handleAddExpense = useCallback(async (formData) => {
    try {
      if (editingExpense) {
        const res = await axios.put('/expenses/' + editingExpense.id, formData);
        const updated = res.data.data;
        setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
        setEditingExpense(null);
      } else {
        const res = await axios.post('/expenses', formData);
        const created = res.data.data;
        setExpenses(prev => [created, ...prev]);
      }
      refreshBudget();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense');
    }
  }, [editingExpense, refreshBudget]);

  const handleEditExpense = useCallback((expense) => {
    setEditingExpense(expense);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDeleteExpense = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    // Optimistic remove
    setExpenses(prev => prev.filter(e => e.id !== id));
    try {
      await axios.delete('/expenses/' + id);
      refreshBudget();
    } catch (err) {
      setError('Failed to delete expense');
      // Revert by refetching
      axios.get('/expenses').then(r => setExpenses(r.data.data || r.data)).catch(() => {});
    }
  }, [refreshBudget]);

  const handleCancelEdit = useCallback(() => setEditingExpense(null), []);
  const handleFilterChange = useCallback((f) => setFilters(f), []);
  const handleClearFilters = useCallback(() => setFilters({ category: '', startDate: '', endDate: '', search: '' }), []);
  const handleBudgetUpdate = useCallback(() => refreshBudget(), [refreshBudget]);

  const handleRecurringExpenseSuccess = useCallback(() => {
    setShowRecurringForm(false);
    Promise.all([
      axios.get('/recurring-expenses'),
      axios.get('/expenses')
    ]).then(([rr, er]) => {
      if (rr.data.success) setRecurringExpenses(rr.data.data);
      setExpenses(er.data.data || er.data);
    }).catch(() => {});
  }, []);

  const handleDeleteRecurringExpense = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this recurring expense?')) return;
    setRecurringExpenses(prev => prev.filter(e => e.id !== id));
    try {
      await axios.delete('/recurring-expenses/' + id);
    } catch (err) {
      setError('Failed to delete recurring expense');
      axios.get('/recurring-expenses').then(r => { if (r.data.success) setRecurringExpenses(r.data.data); }).catch(() => {});
    }
  }, []);

  const paginationData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return {
      currentExpenses: filteredExpenses.slice(indexOfFirstItem, indexOfLastItem),
      totalPages: Math.ceil(filteredExpenses.length / itemsPerPage)
    };
  }, [currentPage, filteredExpenses]);

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
    <motion.div className="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Navbar />
      <motion.div className="dashboard-container">
        {error && (
          <motion.div className="error-banner" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
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

        {budgetData && (
          <BudgetCard
            budget={budgetData.budget}
            totalSpent={budgetData.totalSpent}
            isWarning={budgetData.isWarning}
            isExceeded={budgetData.isExceeded}
          />
        )}

        <SummaryCards expenses={filteredExpenses} />
        <StatisticsInsights expenses={filteredExpenses} budget={budgetData?.budget} />

        <ExpenseForm onSubmit={handleAddExpense} editingExpense={editingExpense} onCancel={handleCancelEdit} />

        <div className="recurring-section">
          <div className="section-header">
            <h2>Recurring Expenses</h2>
            <button onClick={() => setShowRecurringForm(!showRecurringForm)} className="btn-toggle-form">
              {showRecurringForm ? '✕ Cancel' : '+ Add Recurring'}
            </button>
          </div>
          {showRecurringForm && (
            <RecurringExpenseForm onSuccess={handleRecurringExpenseSuccess} onCancel={() => setShowRecurringForm(false)} />
          )}
          {recurringExpenses.length > 0 && (
            <RecurringExpensesList recurringExpenses={recurringExpenses} onDelete={handleDeleteRecurringExpense} />
          )}
        </div>

        <ChartsSection expenses={filteredExpenses} />

        <FilterBar filters={filters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} />

        <ExpenseTable
          expenses={paginationData.currentExpenses}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          currentPage={currentPage}
          totalPages={paginationData.totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredExpenses.length}
        />
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
