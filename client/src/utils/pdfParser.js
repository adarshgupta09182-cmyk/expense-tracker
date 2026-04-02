var amountRe = /^[\d,]+\.\d{2}$/;
function isAmount(s) { return amountRe.test(s.replace(/\s/g, '')); }
function parseAmt(s) { return parseFloat(s.replace(/,/g, '')); }

/**
 * Extract text items WITH their X positions from a PDF.
 * Uses dynamic import so pdfjs-dist is not bundled by Rollup.
 */
export async function extractTextFromPDF(arrayBuffer) {
  var pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://unpkg.com/pdfjs-dist@' + pdfjsLib.version + '/build/pdf.worker.min.mjs';

  var pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  var allRows = [];

  for (var pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    var page = await pdf.getPage(pageNum);
    var content = await page.getTextContent();

    var byY = {};
    for (var ii = 0; ii < content.items.length; ii++) {
      var item = content.items[ii];
      if (!item.str.trim()) continue;
      var y = Math.round(item.transform[5]);
      if (!byY[y]) byY[y] = [];
      byY[y].push({ x: item.transform[4], text: item.str.trim() });
    }

    var sortedYs = Object.keys(byY).map(Number).sort(function(a, b) { return b - a; });
    for (var yi = 0; yi < sortedYs.length; yi++) {
      var rowItems = byY[sortedYs[yi]].sort(function(a, b) { return a.x - b.x; });
      allRows.push({ y: sortedYs[yi], items: rowItems, text: rowItems.map(function(i) { return i.text; }).join(' ') });
    }
  }

  return allRows;
}

/**
 * Parse Kotak (and similar Indian bank) statement format:
 * # | Date | Description | Chq/Ref | Withdrawal(Dr.) | Deposit(Cr.) | Balance
 *
 * Strategy: use balance changes to determine debit vs credit.
 * If balance goes DOWN → debit (withdrawal). If balance goes UP → credit (deposit).
 * Only return debits (withdrawals) as expenses.
 */
export function parsePDFLines(rows) {
  var transactions = [];
  var datePattern = /^(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})$/i;
  var months = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };

  var prevBalance = null;

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

    // Find all amount items
    var amountItems = [];
    for (var ai = 0; ai < items.length; ai++) {
      if (isAmount(items[ai].text)) amountItems.push(items[ai]);
    }
    if (amountItems.length === 0) continue;

    // The LAST amount in the row is always the Balance (rightmost column)
    var balanceItem = amountItems[amountItems.length - 1];
    var currentBalance = parseAmt(balanceItem.text);

    // The transaction amount is the first amount (not the balance)
    // If there's only one amount, it's the balance — skip (no transaction amount)
    if (amountItems.length < 2) {
      prevBalance = currentBalance;
      continue;
    }

    var txnAmount = parseAmt(amountItems[0].text);
    if (txnAmount <= 0) {
      prevBalance = currentBalance;
      continue;
    }

    // Determine type using balance change
    var isDebit;
    if (prevBalance !== null) {
      // Balance went down → debit (withdrawal)
      // Balance went up → credit (deposit)
      isDebit = currentBalance < prevBalance;
    } else {
      // No previous balance — fall back to X-position heuristic
      // Withdrawal column is to the LEFT of Deposit column
      // If only one txn amount, check if it's closer to left (withdrawal) or right (deposit) side
      // Use page midpoint as rough separator
      isDebit = true; // default to debit if we can't tell
    }

    prevBalance = currentBalance;

    // Only keep debits (expenses)
    if (!isDebit) continue;

    // Extract description: items between date and first amount, skip ref numbers
    var dateIdx = items.indexOf(dateItem);
    var firstAmtIdx = -1;
    for (var fi = 0; fi < items.length; fi++) {
      if (isAmount(items[fi].text)) { firstAmtIdx = fi; break; }
    }
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
      amount: txnAmount,
      type: 'debit',
      rawLine: row.text
    });
  }

  return transactions;
}
