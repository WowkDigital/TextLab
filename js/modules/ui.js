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
 * Syncs the highlights backdrop and updates the line numbers in the gutter, taking line wraps into account.
 * @param {string} textareaId 
 * @param {string} highlightsId 
 * @param {string} gutterId 
 * @param {number} startLineOffset 
 */
export function updateLineNumbers(textareaId, highlightsId, gutterId, startLineOffset = 0) {
  const textarea = document.getElementById(textareaId);
  const highlightsEl = document.getElementById(highlightsId);
  const gutter = document.getElementById(gutterId);
  if (!textarea || !highlightsEl || !gutter) return;

  textarea.style.color = 'var(--text)';
  highlightsEl.style.color = 'transparent';

  const text = textarea.value;
  const lines = text.split('\n');
  const linesHtml = lines.map(line => {
    // Empty lines need a zero-width space (&#8203;) to occupy vertical height in the layout
    const content = line === '' ? '&#8203;' : escHtml(line);
    return `<div class="highlight-line">${content}</div>`;
  }).join('');
  highlightsEl.innerHTML = linesHtml;

  // Measure visual heights of highlight lines to perfectly align gutter line numbers
  requestAnimationFrame(() => {
    const highlightLines = highlightsEl.querySelectorAll('.highlight-line');
    let gutterHtml = '';
    highlightLines.forEach((lineEl, index) => {
      const height = lineEl.getBoundingClientRect().height;
      const lineNumber = startLineOffset + index + 1;
      gutterHtml += `<div style="height: ${height}px;">${lineNumber}</div>`;
    });
    gutter.innerHTML = gutterHtml;

    // Keep scrolling in sync
    gutter.scrollTop = textarea.scrollTop;
  });
}

