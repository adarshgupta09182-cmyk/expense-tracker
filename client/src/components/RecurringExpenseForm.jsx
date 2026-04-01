import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from '../utils/axios';
import { useTheme } from '../context/ThemeContext';
import './RecurringExpenseForm.css';

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
  </svg>
);

const RecurringExpenseForm = ({ onSuccess, onCancel, editingExpense }) => {
  const { isDark } = useTheme();
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const [formData, setFormData] = useState({
    description: editingExpense?.description || '',
    amount: editingExpense?.amount || '',
    category: editingExpense?.category || 'Food',
    frequency: editingExpense?.frequency || 'monthly',
    customDays: editingExpense?.custom_days || '',
    startDate: editingExpense?.next_date
      ? new Date(editingExpense.next_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        frequency: formData.frequency,
        customDays: formData.frequency === 'custom' ? parseInt(formData.customDays) : null,
        next_date: formData.startDate || null
      };

      if (editingExpense) {
        await axios.put('/recurring-expenses/' + editingExpense.id, payload);
      } else {
        await axios.post('/recurring-expenses', payload);
      }

      setFormData({
        description: '',
        amount: '',
        category: 'Food',
        frequency: 'monthly',
        customDays: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });

      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create recurring expense');
    } finally {
      setLoading(false);
    }
  }, [formData, onSuccess]);

  return (
    <motion.div
      className="recurring-expense-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="form-header">
        <h3>{editingExpense ? 'Edit Recurring Expense' : 'Add Recurring Expense'}</h3>
        <p className="form-subtitle">Set up automatic expenses that repeat</p>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g., Netflix subscription"
            required
            minLength="3"
            maxLength="200"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount">Amount (₹)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              required
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="Food">Food</option>
              <option value="Travelling">Travelling</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="frequency">Frequency</label>
          <select
            id="frequency"
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            required
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom (days)</option>
          </select>
        </div>

        {formData.frequency === 'custom' && (
          <div className="form-group">
            <label htmlFor="customDays">Repeat every (days)</label>
            <input
              type="number"
              id="customDays"
              name="customDays"
              value={formData.customDays}
              onChange={handleChange}
              placeholder="e.g., 15"
              required
              min="1"
              max="365"
            />
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <div className="date-input-wrapper">
              <input
                ref={startDateRef}
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
              {isDark && (
                <span className="date-icon" onClick={() => startDateRef.current?.showPicker()}>
                  <CalendarIcon />
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date (Optional)</label>
            <div className="date-input-wrapper">
              <input
                ref={endDateRef}
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
              />
              {isDark && (
                <span className="date-icon" onClick={() => endDateRef.current?.showPicker()}>
                  <CalendarIcon />
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-cancel"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : editingExpense ? 'Update Recurring Expense' : 'Create Recurring Expense'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default RecurringExpenseForm;
