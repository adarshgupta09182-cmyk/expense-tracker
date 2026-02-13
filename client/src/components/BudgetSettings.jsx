import { useState, useCallback } from 'react';
import axios from '../utils/axios';
import './BudgetSettings.css';

const BudgetSettings = ({ currentBudget, currentThreshold, onBudgetUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    monthlyBudget: currentBudget || '',
    budgetWarningThreshold: currentThreshold || 80
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthlyBudget' ? parseFloat(value) || '' : parseInt(value)
    }));
    setError('');
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.monthlyBudget && formData.monthlyBudget !== 0) {
      setError('Budget amount is required');
      return false;
    }

    if (formData.monthlyBudget < 0) {
      setError('Budget cannot be negative');
      return false;
    }

    if (formData.budgetWarningThreshold < 0 || formData.budgetWarningThreshold > 100) {
      setError('Warning threshold must be between 0 and 100');
      return false;
    }

    return true;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put('/budget', {
        monthlyBudget: formData.monthlyBudget,
        budgetWarningThreshold: formData.budgetWarningThreshold
      });

      if (response.data.success) {
        setSuccess('Budget updated successfully!');
        onBudgetUpdate();
        setTimeout(() => {
          setIsOpen(false);
          setSuccess('');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update budget');
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, onBudgetUpdate]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setError('');
    setSuccess('');
    setFormData({
      monthlyBudget: currentBudget || '',
      budgetWarningThreshold: currentThreshold || 80
    });
  }, [currentBudget, currentThreshold]);

  return (
    <>
      <button 
        className="budget-settings-btn"
        onClick={() => setIsOpen(true)}
        title="Edit budget settings"
      >
        ⚙️ Budget Settings
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Budget Settings</h2>
              <button 
                className="modal-close"
                onClick={handleClose}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="budget-form">
              {error && (
                <div className="error-message">
                  <span>{error}</span>
                  <button 
                    type="button"
                    onClick={() => setError('')}
                    className="error-close"
                  >
                    ×
                  </button>
                </div>
              )}

              {success && (
                <div className="success-message">
                  {success}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="monthlyBudget">Monthly Budget (₹)</label>
                <input
                  type="number"
                  id="monthlyBudget"
                  name="monthlyBudget"
                  placeholder="Enter your monthly budget"
                  value={formData.monthlyBudget}
                  onChange={handleChange}
                  disabled={loading}
                  step="0.01"
                  min="0"
                  required
                />
                <small>Set your monthly spending limit</small>
              </div>

              <div className="form-group">
                <label htmlFor="budgetWarningThreshold">Warning Threshold (%)</label>
                <div className="threshold-input-group">
                  <input
                    type="range"
                    id="budgetWarningThreshold"
                    name="budgetWarningThreshold"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.budgetWarningThreshold}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span className="threshold-value">
                    {formData.budgetWarningThreshold}%
                  </span>
                </div>
                <small>Show warning when spending reaches this percentage</small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-cancel"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BudgetSettings;
