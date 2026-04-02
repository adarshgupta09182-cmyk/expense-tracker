import { useState, useRef, useCallback } from 'react';
import axios from '../utils/axios';
import './ImportButton.css';

// Keyword-based auto-categorizer
const categorize = (description) => {
  const d = description.toLowerCase();
  if (/swiggy|zomato|dominos|pizza|burger|kfc|mcdonalds|restaurant|cafe|food|eat|biryani|hotel/.test(d)) return 'Food';
  if (/uber|ola|rapido|metro|bus|train|irctc|flight|indigo|spicejet|petrol|fuel|toll/.test(d)) return 'Travelling';
  if (/netflix|amazon prime|hotstar|spotify|youtube|prime|zee5|sony|jio cinema|bookmyshow|pvr|inox/.test(d)) return 'Entertainment';
  if (/amazon|flipkart|myntra|ajio|meesho|nykaa|shopping|mall|store|mart/.test(d)) return 'Shopping';
  if (/electricity|water|gas|broadband|airtel|jio|vi|bsnl|recharge|bill|emi|loan|insurance/.test(d)) return 'Bills';
  return 'Other';
};

// Try to parse common Indian bank CSV formats
const parseCSV = (text) => {
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
      category: categorize(description),
      selected: true
    });
  }

  return rows;
};

const CATEGORIES = ['Food', 'Travelling', 'Entertainment', 'Shopping', 'Bills', 'Other'];

const ImportButton = ({ onImportSuccess }) => {
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);

  const handleFile = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      if (parsed.length === 0) {
        setError('No debit transactions found. Make sure the file is a valid bank statement CSV.');
      } else {
        setTransactions(parsed);
      }
    };
    reader.readAsText(file);
  }, []);

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
                <div className="import-upload-area" onClick={() => fileRef.current?.click()}>
                  <div className="upload-icon">📄</div>
                  <p>Click to upload a CSV bank statement</p>
                  <p className="upload-hint">Supports SBI, HDFC, ICICI, Axis and most Indian bank CSV exports</p>
                  {fileName && <p className="upload-filename">{fileName}</p>}
                  {error && <p className="upload-error">{error}</p>}
                  <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
                </div>
              ) : (
                <>
                  <div className="import-summary">
                    <span>{transactions.length} debit transactions found</span>
                    <span>{selectedCount} selected for import</span>
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
                            <td className="desc-cell" title={t.description}>{t.description}</td>
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
