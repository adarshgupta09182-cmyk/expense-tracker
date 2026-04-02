import { useState, useRef, useCallback } from 'react';
import axios from '../utils/axios';
import { getClassifier } from '../utils/categorizer';
import { extractTextFromPDF, parsePDFLines } from '../utils/pdfParser';
import './ImportButton.css';

// Try to parse common Indian bank CSV formats
const parseCSV = (text, classifier) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Detect header row
  const header = lines[0].toLowerCase();
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
    if (cols.length < 3) continue;

    let date = '', description = '', amount = 0, isDebit = true;

    // Try to detect columns by header keywords
    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());

    const dateIdx = headers.findIndex(h => /date/.test(h));
    const descIdx = headers.findIndex(h => /narration|description|particulars|remarks|details/.test(h));
    const debitIdx = headers.findIndex(h => /debit|withdrawal|dr/.test(h));
    const creditIdx = headers.findIndex(h => /credit|deposit|cr/.test(h));
    const amtIdx = headers.findIndex(h => /amount/.test(h));

    date = cols[dateIdx >= 0 ? dateIdx : 0] || '';
    description = cols[descIdx >= 0 ? descIdx : 1] || '';

    // Parse amount — prefer debit column, fall back to amount column
    const rawDebit = debitIdx >= 0 ? cols[debitIdx] : '';
    const rawAmt = amtIdx >= 0 ? cols[amtIdx] : '';
    const debitVal = parseFloat(rawDebit.replace(/[^0-9.]/g, ''));
    const amtVal = parseFloat(rawAmt.replace(/[^0-9.]/g, ''));

    if (debitIdx >= 0 && !isNaN(debitVal) && debitVal > 0) {
      amount = debitVal;
      isDebit = true;
    } else if (amtIdx >= 0 && !isNaN(amtVal) && amtVal > 0) {
      amount = amtVal;
      // Check if there's a Dr/Cr indicator
      const typeCol = cols.find(c => /^dr$/i.test(c.trim()));
      isDebit = !!typeCol || true;
    } else {
      continue; // skip rows with no parseable amount
    }

    if (!isDebit || amount <= 0 || !description) continue;

    // Parse date — try common formats
    let parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      // Try DD/MM/YYYY or DD-MM-YYYY
      const parts = date.split(/[\/\-]/);
      if (parts.length === 3) {
        const [d, m, y] = parts;
        parsedDate = new Date(`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`);
      }
    }
    if (isNaN(parsedDate)) continue;

    rows.push({
      date: parsedDate.toISOString().split('T')[0],
      description,
      amount,
      category: classifier ? classifier.classify(description) : 'Other',
      mlCategorized: classifier?.trained,
      selected: true
    });
  }

  return rows;
};

const CATEGORIES = ['Food', 'Travelling', 'Entertainment', 'Shopping', 'Bills', 'Other'];

const ImportButton = ({ onImportSuccess, existingExpenses }) => {
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [importing, setImporting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);

  const handleFile = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    setParsing(true);

    try {
      const classifier = getClassifier(existingExpenses);
      let parsed = [];

      if (file.name.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const lines = await extractTextFromPDF(arrayBuffer);
        const rawTxns = parsePDFLines(lines);
        parsed = rawTxns
          .filter(t => t.description && t.description.trim().length > 2)
          .map(t => ({
          ...t,
          category: classifier ? classifier.classify(t.description) : 'Other',
          mlCategorized: classifier?.trained,
          selected: true
        }));
      } else {
        // CSV
        const text = await file.text();
        parsed = parseCSV(text, classifier);
      }

      if (parsed.length === 0) {
        setError('No debit transactions found. Make sure the file is a valid bank statement (CSV or PDF).');
      } else {
        setTransactions(parsed);
      }
    } catch (err) {
      setError('Failed to parse file: ' + err.message);
    } finally {
      setParsing(false);
    }
  }, [existingExpenses]);

  const toggleRow = useCallback((idx) => {
    setTransactions(prev => prev.map((t, i) => i === idx ? { ...t, selected: !t.selected } : t));
  }, []);

  const updateCategory = useCallback((idx, cat) => {
    setTransactions(prev => prev.map((t, i) => i === idx ? { ...t, category: cat } : t));
  }, []);

  const handleImport = useCallback(async () => {
    const selected = transactions.filter(t => t.selected);
    if (selected.length === 0) return;
    setImporting(true);
    try {
      await Promise.all(selected.map(t =>
        axios.post('/expenses', { description: t.description, amount: t.amount, category: t.category, date: t.date })
      ));
      setShowModal(false);
      setTransactions([]);
      setFileName('');
      onImportSuccess?.();
    } catch (err) {
      setError('Import failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setImporting(false);
    }
  }, [transactions, onImportSuccess]);

  const selectedCount = transactions.filter(t => t.selected).length;

  return (
    <>
      <button className="btn-import" onClick={() => setShowModal(true)}>
        ↑ Import Statement
      </button>

      {showModal && (
        <div className="import-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="import-modal">
            <div className="import-header">
              <h2>Import Bank Statement</h2>
              <button className="import-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="import-body">
              {transactions.length === 0 ? (
                <div className="import-upload-area" onClick={() => !parsing && fileRef.current?.click()}>
                  {parsing ? (
                    <>
                      <div className="upload-icon">⏳</div>
                      <p>Parsing file, please wait...</p>
                    </>
                  ) : (
                    <>
                      <div className="upload-icon">📄</div>
                      <p>Click to upload a bank statement</p>
                      <p className="upload-hint">Supports CSV and PDF — SBI, HDFC, ICICI, Axis and most Indian banks</p>
                      {fileName && <p className="upload-filename">{fileName}</p>}
                    </>
                  )}
                  {error && <p className="upload-error">{error}</p>}
                  <input ref={fileRef} type="file" accept=".csv,.pdf" onChange={handleFile} style={{ display: 'none' }} />
                </div>
              ) : (
                <>
                  <div className="import-summary">
                    <span>{transactions.length} debit transactions found</span>
                    <span>{selectedCount} selected for import</span>
                    {transactions[0]?.mlCategorized && (
                      <span className="ml-badge">🤖 ML categorized from your history</span>
                    )}
                    <button className="btn-reupload" onClick={() => { setTransactions([]); setFileName(''); setError(''); }}>
                      Upload different file
                    </button>
                  </div>

                  <div className="import-table-wrapper">
                    <table className="import-table">
                      <thead>
                        <tr>
                          <th><input type="checkbox" checked={selectedCount === transactions.length} onChange={(e) => setTransactions(prev => prev.map(t => ({ ...t, selected: e.target.checked })))} /></th>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Amount (₹)</th>
                          <th>Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((t, i) => (
                          <tr key={i} className={t.selected ? '' : 'row-deselected'}>
                            <td><input type="checkbox" checked={t.selected} onChange={() => toggleRow(i)} /></td>
                            <td>{t.date}</td>
                            <td className="desc-cell">{t.description}</td>
                            <td>₹{t.amount.toFixed(2)}</td>
                            <td>
                              <select value={t.category} onChange={(e) => updateCategory(i, e.target.value)}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {error && <p className="upload-error">{error}</p>}
                </>
              )}
            </div>

            {transactions.length > 0 && (
              <div className="import-footer">
                <button className="btn-cancel-import" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-confirm-import" onClick={handleImport} disabled={importing || selectedCount === 0}>
                  {importing ? 'Importing...' : `Import ${selectedCount} transactions`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImportButton;
