import { useCallback, useState, useRef, useEffect } from 'react';
import axios from '../utils/axios';
import './ExportButton.css';

const ExportButton = ({ filters = {} }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

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

      // Parse CSV — handle quoted fields with commas inside
      const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          if (line[i] === '"') { inQuotes = !inQuotes; }
          else if (line[i] === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
          else { current += line[i]; }
        }
        result.push(current.trim());
        return result;
      };

      const lines = csvText.split('\n').filter(l => l.trim());
      const rows = lines.map(parseCSVLine);

      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      const title = exportType === 'monthly-summary' ? 'Monthly Summary' :
                    exportType === 'expenses-with-budget' ? 'Expenses with Budget' : 'Expense Report';
      const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

      doc.setFontSize(18);
      doc.setTextColor(79, 70, 229);
      doc.text(title, 14, 18);
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text('Generated on ' + date, 14, 26);

      if (rows.length > 1) {
        const headers = rows[0];
        const dataRows = rows.slice(1).filter(r => r.some(c => c));

        autoTable(doc, {
          head: [headers],
          body: dataRows,
          startY: 32,
          styles: {
            fontSize: 9,
            cellPadding: 3,
            overflow: 'linebreak',
            valign: 'middle',
          },
          headStyles: {
            fillColor: [79, 70, 229],
            textColor: 255,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
          tableWidth: 'auto',
          margin: { left: 14, right: 14 },
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
                <button className="fmt-btn fmt-csv" onClick={() => downloadCSV(opt.key)} disabled={loading}>CSV</button>
                <button className="fmt-btn fmt-pdf" onClick={() => downloadPDF(opt.key)} disabled={loading}>PDF</button>
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
