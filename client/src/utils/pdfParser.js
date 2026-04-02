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
 * Handles common Indian bank statement formats.
 */
export function parsePDFLines(lines) {
  const transactions = [];

  // Common date patterns: DD/MM/YYYY, DD-MM-YYYY, DD MMM YYYY
  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i;
  // Amount pattern: numbers with optional commas and decimal
  const amountPattern = /[\d,]+\.\d{2}/g;

  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    if (!dateMatch) continue;

    const amounts = line.match(amountPattern);
    if (!amounts || amounts.length === 0) continue;

    // Parse date
    let parsedDate;
    const rawDate = dateMatch[1];
    const parts = rawDate.split(/[\s\/\-]/);
    if (parts.length === 3) {
      const months = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
      let d, m, y;
      if (isNaN(parts[1])) {
        // DD MMM YYYY
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

    // Extract description: text between date and first amount
    const dateEnd = line.indexOf(dateMatch[0]) + dateMatch[0].length;
    const firstAmtIdx = line.indexOf(amounts[0]);
    let description = line.slice(dateEnd, firstAmtIdx > dateEnd ? firstAmtIdx : undefined).trim();
    if (!description) description = line.trim();
    // Clean up description
    description = description.replace(/\s+/g, ' ').slice(0, 200);

    // Determine debit amount:
    // If there are 2+ amounts, the first is usually debit, second credit (or balance)
    // If line contains "Dr" or "Debit" keyword, use first amount
    // If line contains "Cr" or "Credit", skip (it's income)
    const lowerLine = line.toLowerCase();
    if (/\bcr\b|credit|deposit/.test(lowerLine) && !/\bdr\b|debit|withdrawal/.test(lowerLine)) continue;

    const amount = parseFloat(amounts[0].replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) continue;

    transactions.push({
      date: parsedDate.toISOString().split('T')[0],
      description,
      amount,
      rawLine: line
    });
  }

  return transactions;
}
