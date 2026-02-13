/**
 * Export Button Component
 * Provides CSV export functionality for expenses
 */

import { useCallback, useState } from 'react';
import axios from '../utils/axios';
import './ExportButton.css';

const ExportButton = ({ filters = {} }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  /**
   * Build query parameters from filters
   */
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);
    return params.toString();
  }, [filters]);

  /**
   * Handle CSV export
   */
  const handleExport = useCallback(async (exportType) => {
    setLoading(true);
    setError('');

    try {
      const queryParams = buildQueryParams();
      const url = `/export/${exportType}${queryParams ? '?' + queryParams : ''}`;

      const response = await axios.get(url, {
        responseType: 'blob'
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url_obj = URL.createObjectURL(blob);

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${exportType}_${timestamp}.csv`;

      link.setAttribute('href', url_obj);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowMenu(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Export failed');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  return (
    <div className="export-button-container">
      <div className="export-button-wrapper">
        <button
          className="export-button"
          onClick={() => setShowMenu(!showMenu)}
          disabled={loading}
          title="Export expenses as CSV"
        >
          📥 Export
        </button>

        {showMenu && (
          <div className="export-menu">
            <button
              className="export-option"
              onClick={() => handleExport('expenses')}
              disabled={loading}
            >
              <span className="option-icon">📊</span>
              <span className="option-text">
                <strong>Expenses Only</strong>
                <small>Basic expense list</small>
              </span>
            </button>

            <button
              className="export-option"
              onClick={() => handleExport('expenses-with-budget')}
              disabled={loading}
            >
              <span className="option-icon">💰</span>
              <span className="option-text">
                <strong>With Budget Summary</strong>
                <small>Includes budget analysis</small>
              </span>
            </button>

            <button
              className="export-option"
              onClick={() => handleExport('monthly-summary')}
              disabled={loading}
            >
              <span className="option-icon">📈</span>
              <span className="option-text">
                <strong>Monthly Summary</strong>
                <small>12-month overview</small>
              </span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="export-error">
          <span>{error}</span>
          <button
            className="error-close"
            onClick={() => setError('')}
          >
            ×
          </button>
        </div>
      )}

      {loading && (
        <div className="export-loading">
          Preparing your file...
        </div>
      )}
    </div>
  );
};

export default ExportButton;
