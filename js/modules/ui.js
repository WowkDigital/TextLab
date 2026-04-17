import { escHtml } from './utils.js';

/**
 * Updates a DOM element's text content.
 * @param {string} id 
 * @param {string|number} value 
 */
export function updateEl(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/**
 * Sets the active tab in the UI.
 * @param {string} tabId 
 */
export function setActiveTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  
  const panel = document.getElementById('tab-' + tabId);
  if (panel) panel.style.display = 'block';
  
  const tabs = ['segments', 'unique-words', 'unique-lines', 'frequency', 'transform'];
  const index = tabs.indexOf(tabId);
  const tabBtn = document.querySelectorAll('.tab')[index];
  if (tabBtn) tabBtn.classList.add('active');
}

/**
 * Resets the stats display to zero.
 */
export function resetStatsDisplay() {
  ['s-chars', 's-chars-ns', 's-words', 's-sentences', 's-paragraphs', 's-lines', 's-unique', 's-upper', 's-digits'].forEach(id => updateEl(id, '0'));
  ['s-avgword', 's-avgsen'].forEach(id => updateEl(id, '0'));
  updateEl('s-flesch', '–');
  updateEl('s-readtime', '0 s');
  updateEl('s-speaktime', '0 s');
  updateEl('s-bytes', '0 B');
}

/**
 * Toggles the application theme.
 */
export function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  html.classList.toggle('dark', !isDark);
  html.classList.toggle('light', isDark);
  
  const btn = document.getElementById('themeBtn');
  if (btn) {
    btn.innerHTML = isDark ? 
      '<i data-lucide="moon" style="width:14px;height:14px;"></i>' : 
      '<i data-lucide="sun" style="width:14px;height:14px;"></i>';
    if (window.lucide) window.lucide.createIcons();
  }
}

/**
 * Syncs the highlighter backdrop with textarea content and highlights overflow.
 * @param {string} text 
 * @param {number} limit 
 */
export function syncHighlighter(text, limit) {
  const highlightsEl = document.getElementById('highlights');
  const textarea = document.getElementById('mainText');
  if (!highlightsEl || !textarea) return;

  // If no limit, reset to normal view
  if (!limit || limit <= 0 || text.length <= limit) {
    highlightsEl.innerHTML = escHtml(text.endsWith('\n') ? text + ' ' : text);
    textarea.style.color = 'var(--text)'; // Normal text color
    highlightsEl.style.color = 'transparent'; // Hide backdrop text
    return;
  }

  // When limit is exceeded:
  // 1. Make textarea text transparent (except for caret)
  // 2. Make highlights visible
  textarea.style.color = 'transparent';
  textarea.style.caretColor = 'var(--text)';
  highlightsEl.style.color = 'var(--text)';
  
  const normalText = text.slice(0, limit);
  const excessText = text.slice(limit);
  
  // Create the split view
  highlightsEl.innerHTML = escHtml(normalText) + '<div class="limit-marker">###</div>' + escHtml(excessText);
}
