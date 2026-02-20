import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from './LoadingSpinner';
import './RecurringExpenseForm.css';

const CATEGORIES = ['Food', 'Transport', 'Travelling', 'Entertainment', 'Shopping', 'Bills', 'Other'];
const FREQUENCIES = [
  { value: 'weekly', label: '📅 Weekly' },
  { value: 'monthly', label: '📆 Monthly' },
  { value: 'custom', label: '⚙️ Custom' }
];

const RecurringExpenseForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    frequency: 'monthly',
    customDays: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const [errors, setErrors] = useState({});
  const { success, error: showError } = useToast();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (formData.frequency === 'custom' && (!formData.customDays || parseInt(formData.customDays) <= 0)) {
      newErrors.customDays = 'Custom days must be greater than 0';
    }
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) {
      success('Recurring expense created successfully!');
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        customDays: formData.frequency === 'custom' ? parseInt(formData.customDays) : null
      });
      setFormData({
        description: '',
        amount: '',
        category: 'Food',
        frequency: 'monthly',
        customDays: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
    } else {
      showError('Please fix the errors in the form');
    }
  }, [formData, validateForm, onSubmit, success, showError]);

  return (
    <motion.div
      className="recurring-expense-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="form-header">
        <h3>🔄 Add Recurring Expense</h3>
        <p>Set up automatic expenses that repeat on a schedule</p>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g., Monthly Gym Membership"
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        {/* Amount */}
        <div className="form-group">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={errors.amount ? 'error' : ''}
          />
          {errors.amount && <span className="error-text">{errors.amount}</span>}
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={errors.category ? 'error' : ''}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <span className="error-text">{errors.category}</span>}
        </div>

        {/* Frequency */}
        <div className="form-group">
          <label>Frequency</label>
          <div className="frequency-options">
            {FREQUENCIES.map(freq => (
              <label key={freq.value} className="frequency-label">
                <input
                  type="radio"
                  name="frequency"
                  value={freq.value}
                  checked={formData.frequency === freq.value}
                  onChange={handleChange}
                />
                <span>{freq.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Days */}
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
              min="1"
              max="365"
              className={errors.customDays ? 'error' : ''}
            />
            {errors.customDays && <span className="error-text">{errors.customDays}</span>}
          </div>
        )}

        {/* Start Date */}
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={errors.startDate ? 'error' : ''}
          />
          {errors.startDate && <span className="error-text">{errors.startDate}</span>}
        </div>

        {/* End Date */}
        <div className="form-group">
          <label htmlFor="endDate">End Date (Optional)</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={errors.endDate ? 'error' : ''}
          />
          {errors.endDate && <span className="error-text">{errors.endDate}</span>}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="btn-submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <LoadingSpinner size="sm" />
              Creating...
            </span>
          ) : (
            '✨ Create Recurring Expense'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default RecurringExpenseForm;
