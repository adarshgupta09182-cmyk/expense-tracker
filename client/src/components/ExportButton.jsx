import { useCallback, useState, useRef, useEffect } from 'react';
import axios from '../utils/axios';
import './ExportButton.css';

const ExportButton = ({ filters = {} }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);
    return params.toString();
  }, [filters]);

  const downloadCSV = useCallback(async (exportType) => {
    setLoading(true);
    setError('');
    try {
      const queryParams = buildQueryParams();
      const url = `/export/${exportType}${queryParams ? '?' + queryParams : ''}`;
      const response = await axios.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowMenu(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  const downloadPDF = useCallback(async (exportType) => {
    setLoading(true);
    setError('');
    try {
      const queryParams = buildQueryParams();
      const url = `/export/${exportType}${queryParams ? '?' + queryParams : ''}`;
      const response = await axios.get(url, { responseType: 'text' });
      const csvText = response.data;

      // Parse CSV into rows
      const lines = csvText.split('\n').filter(l => l.trim());
      const rows = lines.map(l => l.split(',').map(c => c.replace(/^"|"$/g, '').trim()));

      const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

      const tableRows = rows.slice(1).map(r =>
        '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>'
      ).join('');

      const headerRow = rows[0] ? '<tr>' + rows[0].map(h => '<th>' + h + '</th>').join('') + '</tr>' : '';

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
        <title>Expense Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          p { color: #666; font-size: 13px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #4F46E5; color: white; padding: 8px 12px; text-align: left; }
          td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) td { background: #f9fafb; }
        </style>
      </head><body>
        <h1>Expense Report</h1>
        <p>Generated on ${date}</p>
        <table><thead>${headerRow}</thead><tbody>${tableRows}</tbody></table>
      </body></html>`;

      const win = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); win.close(); }, 500);
      setShowMenu(false);
    } catch (err) {
      setError('PDF export failed');
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  const exportOptions = [
    { key: 'expenses', icon: '📊', label: 'Expenses Only', desc: 'Basic expense list' },
    { key: 'expenses-with-budget', icon: '💰', label: 'With Budget Summary', desc: 'Includes budget analysis' },
    { key: 'monthly-summary', icon: '📈', label: 'Monthly Summary', desc: '12-month overview' },
  ];

  return (
    <div className="export-button-container" ref={menuRef}>
      <button className="export-button" onClick={() => setShowMenu(!showMenu)} disabled={loading}>
        📥 Export
      </button>

      {showMenu && (
        <div className="export-menu">
          {exportOptions.map(opt => (
            <div key={opt.key} className="export-option-group">
              <div className="export-option-label">
                <span className="option-icon">{opt.icon}</span>
                <span className="option-text">
                  <strong>{opt.label}</strong>
                  <small>{opt.desc}</small>
                </span>
              </div>
              <div className="export-format-btns">
                <button className="fmt-btn fmt-csv" onClick={() => downloadCSV(opt.key)} disabled={loading}>
                  CSV
                </button>
                <button className="fmt-btn fmt-pdf" onClick={() => downloadPDF(opt.key)} disabled={loading}>
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="export-error">
          <span>{error}</span>
          <button className="error-close" onClick={() => setError('')}>×</button>
        </div>
      )}
      {loading && <div className="export-loading">Preparing your file...</div>}
    </div>
  );
};

export default ExportButton;
