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
  const [monthlySummaryPeriod, setMonthlySummaryPeriod] = useState(0); // 0=all, else N months back
  // Per-option date state: { 'expenses': {start,end}, 'expenses-with-budget': {start,end} }
  const [dateRanges, setDateRanges] = useState({
    expenses: { start: filters.startDate || '', end: filters.endDate || '' },
    'expenses-with-budget': { start: filters.startDate || '', end: filters.endDate || '' },
  });
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const buildParams = useCallback((exportType) => {
    const params = new URLSearchParams();
    if (exportType === 'monthly-summary' && monthlySummaryPeriod > 0) {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - monthlySummaryPeriod);
      params.append('startDate', start.toISOString().split('T')[0]);
      params.append('endDate', end.toISOString().split('T')[0]);
    } else {
      const range = dateRanges[exportType];
      if (range) {
        if (range.start) params.append('startDate', range.start);
        if (range.end) params.append('endDate', range.end);
      } else {
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
      }
    }
    if (filters.category) params.append('category', filters.category);
    return params.toString();
  }, [dateRanges, filters, monthlySummaryPeriod]);

  const setDate = (exportType, field, value) => {
    setDateRanges(prev => ({ ...prev, [exportType]: { ...prev[exportType], [field]: value } }));
  };

  const downloadCSV = useCallback(async (exportType) => {
    setLoading(true);
    setError('');
    try {
      const q = buildParams(exportType);
      const url = `/export/${exportType}${q ? '?' + q : ''}`;
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
  }, [buildParams]);

  const downloadPDF = useCallback(async (exportType) => {
    setLoading(true);
    setError('');
    try {
      const q = buildParams(exportType);
      const url = `/export/${exportType}${q ? '?' + q : ''}`;
      const response = await axios.get(url, { responseType: 'text' });
      const csvText = response.data;

      const lines = csvText.split('\n').filter(l => l.trim());
      const rows = lines.map(parseCSVLine);

      let tableStartIdx = 0;
      for (let i = 0; i < rows.length; i++) {
        const firstCell = (rows[i][0] || '').toLowerCase().trim();
        if (firstCell === 'date' || firstCell === 'month') { tableStartIdx = i; break; }
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
      const range = dateRanges[exportType];
      const rangeLabel = range && (range.start || range.end)
        ? (range.start || '...') + ' to ' + (range.end || '...')
        : 'All dates';

      doc.setFontSize(18);
      doc.setTextColor(79, 70, 229);
      doc.text(title, 14, 18);
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text('Generated on ' + date + '  |  Period: ' + rangeLabel, 14, 26);

      let startY = 32;

      if (exportType === 'expenses-with-budget') {
        const budgetRows = [];
        for (let i = 0; i < tableStartIdx; i++) {
          const row = rows[i];
          if (!row || !row[0] || !row[0].trim()) continue;
          const label = row[0].trim();
          const value = row[1] ? row[1].trim() : '';
          if (value && label !== 'EXPENSE REPORT' && label !== 'BUDGET SUMMARY' && label !== 'EXPENSES') {
            budgetRows.push([label, value]);
          }
        }
        if (budgetRows.length > 0) {
          autoTable(doc, {
            head: [['Budget Summary', '']],
            body: budgetRows,
            startY,
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
        // For expense report: pivot categories into columns
        if (exportType === 'expenses' || exportType === 'expenses-with-budget') {
          const CATS = ['Food', 'Travelling', 'Entertainment', 'Shopping', 'Bills', 'Other'];
          // Find column indices from header
          const dateIdx = headers.findIndex(h => /date/i.test(h));
          const descIdx = headers.findIndex(h => /desc/i.test(h));
          const catIdx = headers.findIndex(h => /cat/i.test(h));
          const amtIdx = headers.findIndex(h => /amount/i.test(h));

          // Build pivoted rows
          const catTotals = {};
          CATS.forEach(c => { catTotals[c] = 0; });
          let grandTotal = 0;

          const pivotedRows = dataRows
            .filter(r => r[dateIdx] && r[amtIdx] && !isNaN(parseFloat(r[amtIdx])))
            .map(r => {
              const cat = r[catIdx] || 'Other';
              const amt = parseFloat(r[amtIdx]) || 0;
              const normalizedCat = CATS.includes(cat) ? cat : 'Other';
              if (catTotals[normalizedCat] !== undefined) catTotals[normalizedCat] += amt;
              grandTotal += amt;
              const row = [r[dateIdx], r[descIdx] || ''];
              CATS.forEach(c => row.push(c === normalizedCat ? amt.toFixed(2) : ''));
              row.push(amt.toFixed(2));
              return row;
            });

          // Totals row
          const totalsRow = ['', 'TOTAL'];
          CATS.forEach(c => totalsRow.push(catTotals[c] > 0 ? catTotals[c].toFixed(2) : ''));
          totalsRow.push(grandTotal.toFixed(2));

          const pivotHeaders = ['Date', 'Description', ...CATS, 'Total (Rs)'];

          autoTable(doc, {
            head: [pivotHeaders],
            body: [...pivotedRows, totalsRow],
            startY,
            styles: { fontSize: 8, cellPadding: 2.5, overflow: 'linebreak', valign: 'middle' },
            headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 8 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            // Highlight totals row
            didParseCell: (data) => {
              if (data.row.index === pivotedRows.length) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [230, 230, 250];
                data.cell.styles.textColor = [30, 30, 100];
              }
            },
            columnStyles: {
              0: { cellWidth: 20 },   // Date
              1: { cellWidth: 55 },   // Description
              2: { cellWidth: 18 },   // Food
              3: { cellWidth: 20 },   // Travelling
              4: { cellWidth: 24 },   // Entertainment
              5: { cellWidth: 18 },   // Shopping
              6: { cellWidth: 14 },   // Bills
              7: { cellWidth: 14 },   // Other
              8: { cellWidth: 20 },   // Total
            },
            tableWidth: 'auto',
            margin: { left: 14, right: 14 },
          });
        } else {
          autoTable(doc, {
            head: [headers],
            body: dataRows,
            startY,
            styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak', valign: 'middle' },
            headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            tableWidth: 'auto',
            margin: { left: 14, right: 14 },
          });
        }
      }

      doc.save(exportType + '_' + new Date().toISOString().split('T')[0] + '.pdf');
      setShowMenu(false);
    } catch (err) {
      setError('PDF export failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [buildParams, dateRanges]);

  const exportOptions = [
    { key: 'expenses', icon: '📊', label: 'Expenses Only', desc: 'Basic expense list', hasDateFilter: true },
    { key: 'expenses-with-budget', icon: '💰', label: 'With Budget Summary', desc: 'Includes budget analysis', hasDateFilter: true },
    { key: 'monthly-summary', icon: '📈', label: 'Monthly Summary', desc: '12-month overview', hasDateFilter: false },
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

              {opt.hasDateFilter && (
                <div className="export-option-controls">
                  <div className="export-date-range">
                    <input
                      type="date"
                      value={dateRanges[opt.key]?.start || ''}
                      onChange={e => setDate(opt.key, 'start', e.target.value)}
                      className="export-date-input"
                    />
                    <span className="date-sep">→</span>
                    <input
                      type="date"
                      value={dateRanges[opt.key]?.end || ''}
                      onChange={e => setDate(opt.key, 'end', e.target.value)}
                      className="export-date-input"
                    />
                  </div>
                  <div className="export-format-btns">
                    <button className="fmt-btn fmt-csv" onClick={() => downloadCSV(opt.key)} disabled={loading}>CSV</button>
                    <button className="fmt-btn fmt-pdf" onClick={() => downloadPDF(opt.key)} disabled={loading}>PDF</button>
                  </div>
                </div>
              )}

              {!opt.hasDateFilter && (
                <div className="export-option-controls">
                  <div className="period-chips">
                    {[{label:'3M',val:3},{label:'6M',val:6},{label:'9M',val:9},{label:'1Y',val:12},{label:'All',val:0}].map(p => (
                      <button
                        key={p.val}
                        className={`period-chip${monthlySummaryPeriod === p.val ? ' active' : ''}`}
                        onClick={() => setMonthlySummaryPeriod(p.val)}
                      >{p.label}</button>
                    ))}
                  </div>
                  <div className="export-format-btns">
                    <button className="fmt-btn fmt-csv" onClick={() => downloadCSV(opt.key)} disabled={loading}>CSV</button>
                    <button className="fmt-btn fmt-pdf" onClick={() => downloadPDF(opt.key)} disabled={loading}>PDF</button>
                  </div>
                </div>
              )}
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
