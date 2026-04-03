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

      // Dynamic import jsPDF to avoid bundling issues
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      const title = exportType === 'monthly-summary' ? 'Monthly Summary' :
                    exportType === 'expenses-with-budget' ? 'Expenses with Budget' : 'Expense Report';

      // Title
      doc.setFontSize(18);
      doc.setTextColor(79, 70, 229);
      doc.text(title, 14, 18);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Generated on ' + date, 14, 26);

      // Table
      if (rows.length > 1) {
        const headers = rows[0];
        const dataRows = rows.slice(1).filter(r => r.some(c => c));

        const colWidth = (doc.internal.pageSize.width - 28) / headers.length;
        let y = 34;

        // Header row
        doc.setFillColor(79, 70, 229);
        doc.rect(14, y, doc.internal.pageSize.width - 28, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        headers.forEach((h, i) => {
          doc.text(h.slice(0, 20), 16 + i * colWidth, y + 5.5);
        });
        y += 8;

        // Data rows
        doc.setFont(undefined, 'normal');
        dataRows.forEach((row, ri) => {
          if (y > doc.internal.pageSize.height - 20) {
            doc.addPage();
            y = 20;
          }
          if (ri % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(14, y, doc.internal.pageSize.width - 28, 7, 'F');
          }
          doc.setTextColor(30, 30, 30);
          row.forEach((cell, i) => {
            doc.text(String(cell).slice(0, 22), 16 + i * colWidth, y + 5);
          });
          y += 7;
        });
      }

      const filename = exportType + '_' + new Date().toISOString().split('T')[0] + '.pdf';
      doc.save(filename);
      setShowMenu(false);
    } catch (err) {
      setError('PDF export failed: ' + err.message);
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
