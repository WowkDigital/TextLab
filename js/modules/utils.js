/**
 * Escapes HTML characters to prevent XSS.
 * @param {string} s 
 * @returns {string}
 */
export function escHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
}

/**
 * Shows a temporary toast message.
 * @param {string} msg 
 */
export function showToast(msg) {
  const el = document.createElement('div');
  el.className = 'copy-feedback';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    el.style.transition = 'opacity 0.3s, transform 0.3s';
    setTimeout(() => el.remove(), 300);
  }, 2000);
}

/**
 * Formats time in seconds to a human-readable string.
 * @param {number} sec 
 * @returns {string}
 */
export function formatTime(sec) {
  if (sec < 60) return sec + ' s';
  const m = Math.floor(sec / 60), s = sec % 60;
  return m + ' min' + (s ? ' ' + s + ' s' : '');
}

/**
 * Formats bytes to KB/MB.
 * @param {number} b 
 * @returns {string}
 */
export function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1024 / 1024).toFixed(2) + ' MB';
}

/**
 * Counts syllables in a text (approximate).
 * @param {string} text 
 * @returns {number}
 */
export function countSyllables(text) {
  const words = text.toLowerCase().split(/\s+/);
  let count = 0;
  for (const w of words) {
    // Basic syllable counting for English
    let word = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const m = word.match(/[aeiouy]{1,2}/g);
    count += m ? m.length : 0;
  }
  return count || 1;
}

export const STOPWORDS = new Set(['a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves']);
