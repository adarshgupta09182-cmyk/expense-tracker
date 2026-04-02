/**
 * Naive Bayes text classifier for expense categorization.
 * Trains on the user's existing expenses, falls back to keyword rules.
 */

const CATEGORIES = ['Food', 'Travelling', 'Entertainment', 'Shopping', 'Bills', 'Other'];

// Keyword fallback rules
const KEYWORD_RULES = [
  { pattern: /swiggy|zomato|dominos|pizza|burger|kfc|mcdonalds|restaurant|cafe|food|eat|biryani|hotel|bakery|dhaba|canteen|mess|tiffin/i, category: 'Food' },
  { pattern: /uber|ola|rapido|metro|bus|train|irctc|flight|indigo|spicejet|petrol|fuel|toll|parking|cab|auto|rickshaw|redbus/i, category: 'Travelling' },
  { pattern: /netflix|amazon prime|hotstar|spotify|youtube|prime|zee5|sony|jio cinema|bookmyshow|pvr|inox|game|steam|playstation/i, category: 'Entertainment' },
  { pattern: /amazon|flipkart|myntra|ajio|meesho|nykaa|shopping|mall|store|mart|market|bazaar|reliance|dmart/i, category: 'Shopping' },
  { pattern: /electricity|water|gas|broadband|airtel|jio|vi|bsnl|recharge|bill|emi|loan|insurance|rent|maintenance|society/i, category: 'Bills' },
];

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

export function keywordCategorize(description) {
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(description)) return rule.category;
  }
  return 'Other';
}

export class NaiveBayesClassifier {
  constructor() {
    this.wordCounts = {};   // { category: { word: count } }
    this.categoryCounts = {}; // { category: total docs }
    this.totalDocs = 0;
    this.trained = false;

    for (const cat of CATEGORIES) {
      this.wordCounts[cat] = {};
      this.categoryCounts[cat] = 0;
    }
  }

  train(expenses) {
    if (!expenses || expenses.length < 5) return; // need minimum data

    for (const exp of expenses) {
      const cat = exp.category;
      if (!CATEGORIES.includes(cat)) continue;
      const tokens = tokenize(exp.description);
      this.categoryCounts[cat]++;
      this.totalDocs++;
      for (const token of tokens) {
        this.wordCounts[cat][token] = (this.wordCounts[cat][token] || 0) + 1;
      }
    }

    this.trained = this.totalDocs >= 5;
  }

  classify(description) {
    if (!this.trained) return keywordCategorize(description);

    const tokens = tokenize(description);
    let bestCategory = 'Other';
    let bestScore = -Infinity;

    for (const cat of CATEGORIES) {
      const catCount = this.categoryCounts[cat] || 0;
      if (catCount === 0) continue;

      // Log prior probability
      let score = Math.log(catCount / this.totalDocs);

      // Total words in this category (for smoothing)
      const totalWords = Object.values(this.wordCounts[cat]).reduce((s, c) => s + c, 0);
      const vocabSize = Object.keys(this.wordCounts[cat]).length;

      for (const token of tokens) {
        const wordCount = this.wordCounts[cat][token] || 0;
        // Laplace smoothing
        score += Math.log((wordCount + 1) / (totalWords + vocabSize + 1));
      }

      if (score > bestScore) {
        bestScore = score;
        bestCategory = cat;
      }
    }

    // If classifier is uncertain (all categories have very similar scores),
    // fall back to keyword rules
    const keywordResult = keywordCategorize(description);
    if (keywordResult !== 'Other') return keywordResult;

    return bestCategory;
  }
}

// Singleton instance — trained once per session
let classifierInstance = null;

export function getClassifier(expenses) {
  if (!classifierInstance) {
    classifierInstance = new NaiveBayesClassifier();
  }
  if (expenses && expenses.length > 0) {
    classifierInstance.train(expenses);
  }
  return classifierInstance;
}

export function resetClassifier() {
  classifierInstance = null;
}
