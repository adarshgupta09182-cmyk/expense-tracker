import { useCallback, useState, useRef, useEffect } from 'react';
import axios from '../utils/axios';
import './ExportButton.css';

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

      // Parse all lines
      const lines = csvText.split('\n').filter(l => l.trim());
      const rows = lines.map(parseCSVLine);

      // The CSV has metadata rows before the actual table.
      // Find the real header row: the one whose first cell is 'Date' or 'Month'
      let tableStartIdx = 0;
      for (let i = 0; i < rows.length; i++) {
        const firstCell = (rows[i][0] || '').toLowerCase().trim();
        if (firstCell === 'date' || firstCell === 'month') {
          tableStartIdx = i;
          break;
        }
      }

      const tableRows = rows.slice(tableStartIdx);
      const headers = tableRows[0] || [];
      const dataRows = tableRows.slice(1).filter(r => r.some(c => c && c.trim()));

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

      let startY = 32;

      // For expenses-with-budget: render budget summary section first
      if (exportType === 'expenses-with-budget') {
        const budgetRows = [];
        for (let i = 0; i < tableStartIdx; i++) {
          const row = rows[i];
          if (!row || !row[0] || !row[0].trim()) continue;
          const label = row[0].trim();
          const value = row[1] ? row[1].trim() : '';
          // Only include meaningful key-value pairs
          if (value && label !== 'EXPENSE REPORT' && label !== 'BUDGET SUMMARY' && label !== 'EXPENSES') {
            budgetRows.push([label, value]);
          }
        }

        if (budgetRows.length > 0) {
          autoTable(doc, {
            head: [['Budget Summary', '']],
            body: budgetRows,
            startY: startY,
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 }, 1: { cellWidth: 60 } },
            tableWidth: 'wrap',
            margin: { left: 14, right: 14 },
          });
          startY = doc.lastAutoTable.finalY + 8;
        }
      }

      if (headers.length > 0 && dataRows.length > 0) {
        autoTable(doc, {
          head: [headers],
          body: dataRows,
          startY: startY,
          styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak', valign: 'middle' },
          headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
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
