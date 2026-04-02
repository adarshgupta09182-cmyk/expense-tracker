import * as pdfjsLib from 'pdfjs-dist';

// Use the bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Extract all text lines from a PDF file (ArrayBuffer)
 */
export async function extractTextFromPDF(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const lines = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    // Group items by approximate Y position to reconstruct rows
    const byY = {};
    for (const item of content.items) {
      if (!item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      if (!byY[y]) byY[y] = [];
      byY[y].push({ x: item.transform[4], text: item.str });
    }

    // Sort rows top-to-bottom, items left-to-right
    const sortedYs = Object.keys(byY).map(Number).sort((a, b) => b - a);
    for (const y of sortedYs) {
      const rowItems = byY[y].sort((a, b) => a.x - b.x);
      lines.push(rowItems.map(i => i.text).join(' '));
    }
  }

  return lines;
}

/**
 * Parse transaction rows from extracted PDF text lines.
 * Returns ALL transactions with a `type` field: 'debit' or 'credit'
 * The UI will pre-deselect credits.
 */
export function parsePDFLines(lines) {
  const transactions = [];

  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i;

  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    if (!dateMatch) continue;

    const amounts = [...line.matchAll(/[\d,]+\.\d{2}/g)].map(m => ({
      value: parseFloat(m[0].replace(/,/g, '')),
      index: m.index
    })).filter(a => a.value > 0);

    if (amounts.length === 0) continue;

    const lower = line.toLowerCase();

    // Determine type using explicit keywords first
    const hasDebitKw = /\bdr\b|\bdebit\b|\bwithdrawal\b|\bpurchase\b|\bpaid\b/.test(lower);
    const hasCreditKw = /\bcr\b|\bcredit\b|\bdeposit\b|\brefund\b|\bneft cr\b|\bimps cr\b|\breceived\b/.test(lower);

    let type = 'debit'; // default assumption

    if (hasCreditKw && !hasDebitKw) {
      type = 'credit';
    } else if (hasDebitKw && !hasCreditKw) {
      type = 'debit';
    } else if (amounts.length >= 3) {
      // Layout: Date | Narration | Debit | Credit | Balance
      // amounts[0]=debit, amounts[1]=credit, amounts[2]=balance
      // If debit column (amounts[0]) is 0 and credit (amounts[1]) > 0 → credit
      // We can't know which is 0 from text alone, so check position:
      // Credit column is typically to the RIGHT of debit column
      // If amounts[1] exists and amounts[0] looks like a round number that could be 0...
      // Best heuristic: if description contains "NEFT" or "IMPS" or "UPI" with no merchant → could be either
      // Default to debit for UPI payments (most common expense type)
      type = 'debit';
    } else if (amounts.length === 2) {
      // Could be Debit | Balance or Credit | Balance
      // No reliable way to tell — mark as debit by default, user can toggle
      type = 'debit';
    }

    // Extract description
    const dateEnd = line.indexOf(dateMatch[0]) + dateMatch[0].length;
    const firstAmtIdx = amounts[0].index;
    let description = line.slice(dateEnd, firstAmtIdx > dateEnd ? firstAmtIdx : undefined).trim();
    if (!description || description.length < 3) continue;
    description = description.replace(/\s+/g, ' ').slice(0, 200);

    // Parse date
    let parsedDate;
    const rawDate = dateMatch[1];
    const parts = rawDate.split(/[\s\/\-]/);
    if (parts.length === 3) {
      const months = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
      let d, m, y;
      if (isNaN(parts[1])) {
        d = parseInt(parts[0]); m = months[parts[1].toLowerCase().slice(0,3)]; y = parseInt(parts[2]);
      } else {
        d = parseInt(parts[0]); m = parseInt(parts[1]); y = parseInt(parts[2]);
        if (y < 100) y += 2000;
      }
      parsedDate = new Date(y, m - 1, d);
    }

    if (!parsedDate || isNaN(parsedDate.getTime())) continue;

    transactions.push({
      date: parsedDate.toISOString().split('T')[0],
      description,
      amount: amounts[0].value,
      type, // 'debit' or 'credit'
      rawLine: line
    });
  }

  return transactions;
}
  const transactions = [];

  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i;
  const amountPattern = /[\d,]+\.\d{2}/g;

  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    if (!dateMatch) continue;

    const amounts = [...line.matchAll(/[\d,]+\.\d{2}/g)].map(m => ({
      value: parseFloat(m[0].replace(/,/g, '')),
      index: m.index
    })).filter(a => a.value > 0);

    if (amounts.length === 0) continue;

    const lower = line.toLowerCase();

    // --- Determine transaction type ---
    // 1. Explicit keyword check
    const hasDebitKeyword = /\bdr\b|\bdebit\b|\bwithdrawal\b|\bpurchase\b/.test(lower);
    const hasCreditKeyword = /\bcr\b|\bcredit\b|\bdeposit\b|\brefund\b|\bneft cr\b|\bimps cr\b/.test(lower);

    if (hasCreditKeyword && !hasDebitKeyword) continue; // skip credits/deposits

    // 2. For lines with 2+ amounts: in most Indian bank statements the layout is:
    //    Date | Narration | Debit | Credit | Balance
    //    So: amounts[0] = debit (if non-zero), amounts[1] = credit (if non-zero)
    //    If amounts[0] is 0 or missing and amounts[1] has value → it's a credit, skip
    let debitAmount = 0;

    if (amounts.length >= 2) {
      // Check if first non-zero amount is in the debit column position
      // Heuristic: debit column comes before credit column (left to right)
      // If the second amount is significantly larger, it might be the balance — use first
      const first = amounts[0].value;
      const second = amounts[1].value;

      // If first amount is 0 and second is non-zero → credit row, skip
      if (first === 0 && second > 0) continue;

      // If line has "cr" near the second amount position, it's a credit
      const afterFirst = line.slice(amounts[0].index + amounts[0].value.toString().length);
      if (/cr/i.test(afterFirst.slice(0, 10))) continue;

      debitAmount = first;
    } else {
      // Single amount — use keyword context
      if (hasCreditKeyword) continue;
      debitAmount = amounts[0].value;
    }

    if (debitAmount <= 0) continue;

    // Extract description: text between date and first amount
    const dateEnd = line.indexOf(dateMatch[0]) + dateMatch[0].length;
    const firstAmtIdx = amounts[0].index;
    let description = line.slice(dateEnd, firstAmtIdx > dateEnd ? firstAmtIdx : undefined).trim();
    if (!description || description.length < 3) continue;
    description = description.replace(/\s+/g, ' ').slice(0, 200);

    // Parse date
    let parsedDate;
    const rawDate = dateMatch[1];
    const parts = rawDate.split(/[\s\/\-]/);
    if (parts.length === 3) {
      const months = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
      let d, m, y;
      if (isNaN(parts[1])) {
        d = parseInt(parts[0]);
        m = months[parts[1].toLowerCase().slice(0,3)];
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
      description,
      amount: debitAmount,
      rawLine: line
    });
  }

  return transactions;
}
