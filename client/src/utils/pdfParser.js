const amountRe = /^[\d,]+\.\d{2}$/;
const isAmount = (s) => amountRe.test(s.replace(/\s/g, ''));
const parseAmt = (s) => parseFloat(s.replace(/,/g, ''));

/**
 * Extract text items WITH their X positions from a PDF.
 * Uses dynamic import so pdfjs-dist is not bundled by Rollup.
 */
export async function extractTextFromPDF(arrayBuffer) {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + pdfjsLib.version + '/pdf.worker.min.mjs';

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const allRows = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const byY = {};
    for (const item of content.items) {
      if (!item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      if (!byY[y]) byY[y] = [];
      byY[y].push({ x: item.transform[4], text: item.str.trim() });
    }

    const sortedYs = Object.keys(byY).map(Number).sort((a, b) => b - a);
    for (const y of sortedYs) {
      const items = byY[y].sort((a, b) => a.x - b.x);
      allRows.push({ y, items, text: items.map(function(i) { return i.text; }).join(' ') });
    }
  }

  return allRows;
}

/**
 * Parse the standard Indian bank statement format:
 * # | Date | Description | Chq/Ref | Withdrawal(Dr.) | Deposit(Cr.) | Balance
 *
 * Detects column X positions from the header row to classify debit vs credit.
 */
export function parsePDFLines(rows) {
  var transactions = [];

  // Find header row to get column X positions
  var withdrawalX = null;
  var depositX = null;
  var balanceX = null;

  for (var h = 0; h < rows.length; h++) {
    var rowText = rows[h].text.toLowerCase();
    if (/withdrawal|debit|dr\./.test(rowText) && /deposit|credit|cr\./.test(rowText)) {
      for (var hi = 0; hi < rows[h].items.length; hi++) {
        var ht = rows[h].items[hi].text.toLowerCase();
        if (/withdrawal|debit/.test(ht)) withdrawalX = rows[h].items[hi].x;
        if (/deposit|credit/.test(ht)) depositX = rows[h].items[hi].x;
        if (/balance/.test(ht)) balanceX = rows[h].items[hi].x;
      }
      break;
    }
  }

  var datePattern = /^(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})$/i;
  var months = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };

  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var items = row.items;
    if (items.length < 3) continue;

    // Find date item
    var dateItem = null;
    for (var di = 0; di < items.length; di++) {
      if (datePattern.test(items[di].text.trim())) { dateItem = items[di]; break; }
    }
    if (!dateItem) continue;

    // Find amount items
    var amountItems = items.filter(function(i) { return isAmount(i.text); });
    if (amountItems.length === 0) continue;

    var withdrawalAmt = 0;
    var depositAmt = 0;

    if (withdrawalX !== null && depositX !== null) {
      for (var ai = 0; ai < amountItems.length; ai++) {
        var item = amountItems[ai];
        var dW = Math.abs(item.x - withdrawalX);
        var dD = Math.abs(item.x - depositX);
        var dB = balanceX !== null ? Math.abs(item.x - balanceX) : Infinity;
        var minD = Math.min(dW, dD, dB);
        if (minD === dW) withdrawalAmt = parseAmt(item.text);
        else if (minD === dD) depositAmt = parseAmt(item.text);
      }
    } else {
      var lower = row.text.toLowerCase();
      if (/\bcr\b|\bcredit\b|\bdeposit\b|\brefund\b/.test(lower) &&
          !/\bdr\b|\bdebit\b|\bwithdrawal\b/.test(lower)) {
        depositAmt = parseAmt(amountItems[0].text);
      } else {
        withdrawalAmt = parseAmt(amountItems[0].text);
      }
    }

    if (withdrawalAmt <= 0 && depositAmt <= 0) continue;

    var type = withdrawalAmt > 0 ? 'debit' : 'credit';
    var amount = withdrawalAmt > 0 ? withdrawalAmt : depositAmt;

    // Extract description
    var dateIdx = items.indexOf(dateItem);
    var firstAmtIdx = items.findIndex(function(i) { return isAmount(i.text); });
    var descItems = items.slice(dateIdx + 1, firstAmtIdx > dateIdx ? firstAmtIdx : undefined)
      .filter(function(i) { return !isAmount(i.text) && !/^UPI-\d+$|^NEFT-|^IMPS-/.test(i.text); });
    var description = descItems.map(function(i) { return i.text; }).join(' ').trim();
    if (!description || description.length < 3) continue;
    description = description.replace(/\s+/g, ' ').slice(0, 200);

    // Parse date
    var parsedDate;
    var rawDate = dateItem.text.trim();
    var parts = rawDate.split(/[\s\/\-]/);
    if (parts.length === 3) {
      var d, m, y;
      if (isNaN(parts[1])) {
        d = parseInt(parts[0]);
        m = months[parts[1].toLowerCase().slice(0, 3)];
        y = parseInt(parts[2]);
      } else {
        d = parseInt(parts[0]);
        m = parseInt(parts[1]);
        y = parseInt(parts[2]);
        if (y < 100) y += 2000;
      }
      parsedDate = new Date(y, m - 1, d);
    }
    if (!parsedDate || isNaN(parsedDate.getTime())) continue;

    transactions.push({
      date: parsedDate.toISOString().split('T')[0],
      description: description,
      amount: amount,
      type: type,
      rawLine: row.text
    });
  }

  return transactions;
}
