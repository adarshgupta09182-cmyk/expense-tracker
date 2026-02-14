import { useState, useEffect, useCallback, useMemo } from 'react';
import './ExpenseForm.css';

const validateDescription = (desc) => {
  return desc.trim().length >= 2;
};

const validateAmount = (amount) => {
  return amount > 0;
};

const ExpenseForm = ({ onSubmit, editingExpense, onCancel }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        description: editingExpense.description,
        amount: editingExpense.amount,
        category: editingExpense.category,
        date: editingExpense.date.split('T')[0]
      });
      setErrors({});
    } else {
      // Reset form when not editing
      setFormData({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      setErrors({});
    }
  }, [editingExpense]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.description) {
      newErrors.description = 'Description is required';
    } else if (!validateDescription(formData.description)) {
      newErrors.description = 'Description must be at least 2 characters';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (!validateAmount(formData.amount)) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      if (!editingExpense) {
        setFormData({
          description: '',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0]
        });
        setErrors({});
      }
    } finally {
      setLoading(false);
    }
  }, [formData, onSubmit, editingExpense, validateForm]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const isFormValid = useMemo(() => {
    return formData.description && formData.amount && formData.category && formData.date && !loading;
  }, [formData, loading]);

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
      <div className="form-grid">
        <div className="form-group">
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
            className={errors.description ? 'input-error' : ''}
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>

        <div className="form-group">
          <input
            type="number"
            name="amount"
            placeholder="Amount (₹)"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            disabled={loading}
            className={errors.amount ? 'input-error' : ''}
          />
          {errors.amount && <span className="field-error">{errors.amount}</span>}
        </div>

        <div className="form-group">
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={loading}
            className={errors.category ? 'input-error' : ''}
          >
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Travelling">Travelling</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && <span className="field-error">{errors.category}</span>}
        </div>

        <div className="form-group">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            disabled={loading}
            className={errors.date ? 'input-error' : ''}
          />
          {errors.date && <span className="field-error">{errors.date}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          className="btn-primary"
          disabled={!isFormValid}
        >
          {loading ? 'Saving...' : (editingExpense ? 'Update' : 'Add') + ' Expense'}
        </button>
        {editingExpense && (
          <button 
            type="button" 
            onClick={onCancel} 
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;
