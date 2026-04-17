/**
 * Collection of text transformation functions.
 */
export const transforms = {
  upper: (t) => t.toUpperCase(),
  lower: (t) => t.toLowerCase(),
  title: (t) => t.replace(/\b\w/g, c => c.toUpperCase()),
  sentence: (t) => t.toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase()),
  reverse: (t) => t.split('').reverse().join(''),
  reversewords: (t) => t.split(/\s+/).reverse().join(' '),
  removeExtraSpaces: (t) => t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim(),
  removeDuplicateLines: (t) => {
    const lines = t.split('\n');
    return [...new Set(lines)].join('\n');
  },
  removeEmptyLines: (t) => t.split('\n').filter(l => l.trim()).join('\n'),
  sortLines: (t) => t.split('\n').sort((a, b) => a.localeCompare(b, 'en')).join('\n'),
  slugify: (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-'),
  extractEmails: (t) => (t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).join('\n') || '(none)',
  extractUrls: (t) => (t.match(/https?:\/\/[^\s]+/g) || []).join('\n') || '(none)',
  extractNumbers: (t) => (t.match(/-?\d+([.,]\d+)?/g) || []).join('\n') || '(none)'
};

/**
 * Segments text into smaller parts.
 * @param {string} t 
 * @param {number} len 
 * @param {boolean} keepSentences 
 * @returns {string[]}
 */
export function segmentText(t, len = 500, keepSentences = true) {
  if (!t.trim()) return [];
  
  let segments = [];
  if (keepSentences) {
    const sentenceRegex = /[^.!?\n]+[.!?\n]*/g;
    const sentences = [];
    let m;
    while ((m = sentenceRegex.exec(t)) !== null) sentences.push(m[0]);
    if (!sentences.length) sentences.push(t);
    
    let current = '';
    for (const sent of sentences) {
      if (current.length + sent.length > len && current.length > 0) {
        segments.push(current.trim());
        current = sent;
      } else {
        current += sent;
      }
    }
    if (current.trim()) segments.push(current.trim());
  } else {
    for (let i = 0; i < t.length; i += len) {
      segments.push(t.slice(i, i + len));
    }
  }
  return segments;
}
