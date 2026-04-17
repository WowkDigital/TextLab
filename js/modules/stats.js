import { countSyllables } from './utils.js';

/**
 * Calculates all text statistics.
 * @param {string} t 
 * @returns {object}
 */
export function calculateStats(t) {
  if (!t) return null;

  const chars = t.length;
  const charsNS = t.replace(/\s/g, '').length;
  const words = t.trim() ? t.trim().split(/\s+/).filter(w => w.length > 0) : [];
  const wordCount = words.length;
  const lines = t.split('\n');
  const sentences = t.split(/[.!?]+/).filter(s => s.trim().length > 2);
  const paragraphs = t.split(/\n\s*\n/).filter(p => p.trim());
  
  const cleanWords = words.map(w => w.toLowerCase().replace(/[^\w]/g, '')).filter(w => w);
  const uniqueWords = new Set(cleanWords);
  
  const avgWordLen = wordCount ? (cleanWords.reduce((a, w) => a + w.length, 0) / wordCount).toFixed(1) : 0;
  const avgSenLen = sentences.length ? (wordCount / sentences.length).toFixed(1) : 0;
  
  const syllables = countSyllables(t);
  const flesch = wordCount && sentences.length ? Math.round(206.835 - 1.015 * (wordCount / sentences.length) - 84.6 * (syllables / wordCount)) : null;
  
  const readTimeSec = Math.round(wordCount / 3.5);
  const speakTimeSec = Math.round(wordCount / 2.5);
  const upper = (t.match(/[A-Z]/g) || []).length;
  const digits = (t.match(/\d/g) || []).length;
  const bytes = new Blob([t]).size;

  return {
    chars,
    charsNS,
    wordCount,
    sentences: sentences.length,
    paragraphs: paragraphs.length || (t.trim() ? 1 : 0),
    lines: lines.length,
    uniqueWords: uniqueWords.size,
    avgWordLen,
    avgSenLen,
    flesch,
    readTimeSec,
    speakTimeSec,
    upper,
    digits,
    bytes
  };
}
