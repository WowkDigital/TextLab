import { escHtml, showToast, formatTime, formatBytes, STOPWORDS } from './modules/utils.js';
import { calculateStats } from './modules/stats.js';
import { transforms, segmentText } from './modules/transforms.js';
import { setActiveTab, resetStatsDisplay, toggleTheme, updateEl, syncHighlighter } from './modules/ui.js';

// Global state
const state = {
  currentTab: 'segments',
  text: ''
};

// Initialize app
function init() {
  if (window.lucide) window.lucide.createIcons();
  
  // Attach global functions for HTML access
  window.switchTab = (tab) => {
    state.currentTab = tab;
    setActiveTab(tab);
    
    // Auto-execute operations when tab is clicked
    if (state.text) {
      if (tab === 'segments') window.segmentText();
      else if (tab === 'unique-words') window.getUniqueWords();
      else if (tab === 'unique-lines') window.getUniqueLines();
      else if (tab === 'frequency') window.getFrequency();
    }
  };
  
  window.toggleTheme = toggleTheme;
  
  window.onTextChange = () => {
    refreshTextFlow('main');
  };

  window.onOverflowChange = () => {
    refreshTextFlow('overflow');
  };

  /**
   * Refreshes the text distribution between main and overflow textareas.
   * @param {'main'|'overflow'|'limit'} source The source of the change
   */
  function refreshTextFlow(source) {
    const mainTextarea = document.getElementById('mainText');
    const overflowTextarea = document.getElementById('overflowText');
    const limit = parseInt(document.getElementById('limitInput').value);
    const overflowSection = document.getElementById('overflowSection');

    if (limit && limit > 0) {
      // 1. Push from main to overflow
      if (mainTextarea.value.length > limit) {
        const excess = mainTextarea.value.slice(limit);
        const normal = mainTextarea.value.slice(0, limit);
        const hadFocus = document.activeElement === mainTextarea;
        
        mainTextarea.value = normal;
        overflowTextarea.value = excess + overflowTextarea.value;
        
        if (hadFocus) {
          overflowTextarea.focus();
          overflowTextarea.setSelectionRange(excess.length, excess.length);
        }
      } 
      // 2. Pull from overflow to main
      else if (mainTextarea.value.length < limit && overflowTextarea.value.length > 0) {
        const space = limit - mainTextarea.value.length;
        const pull = overflowTextarea.value.slice(0, space);
        const remaining = overflowTextarea.value.slice(space);
        
        const hadFocus = document.activeElement === overflowTextarea;
        const selStart = overflowTextarea.selectionStart;

        mainTextarea.value += pull;
        overflowTextarea.value = remaining;
        
        if (hadFocus) {
          if (selStart < space) {
            mainTextarea.focus();
            const newPos = mainTextarea.value.length - (pull.length - selStart);
            mainTextarea.setSelectionRange(newPos, newPos);
          } else {
            overflowTextarea.focus();
            const newPos = selStart - space;
            overflowTextarea.setSelectionRange(newPos, newPos);
          }
        }
      }
    } else {
      // No limit: move everything to main
      if (overflowTextarea.value.length > 0) {
        mainTextarea.value += overflowTextarea.value;
        overflowTextarea.value = '';
      }
    }

    state.text = mainTextarea.value + overflowTextarea.value;
    
    const isOverflowing = overflowTextarea.value.length > 0;
    overflowSection.style.display = (isOverflowing || (limit && (mainTextarea.value.length + overflowTextarea.value.length) > limit)) ? 'block' : 'none';

    updateStats();
    updateLimitBar();
    updateLineNumbers();
    syncHighlighter(mainTextarea.value, limit);
  }

  window.copyOverflow = () => {
    const overflowTextarea = document.getElementById('overflowText');
    window.copyText(overflowTextarea.value);
  };

  /**
   * Updates the line numbers in the gutter.
   */
  function updateLineNumbers() {
    const gutter = document.getElementById('gutter');
    const overflowGutter = document.getElementById('overflowGutter');
    if (!gutter) return;
    
    const mainLines = document.getElementById('mainText').value.split('\n');
    const overflowLines = document.getElementById('overflowText').value.split('\n');
    const mainLineCount = mainLines.length;
    const overflowLineCount = overflowLines.length;
    
    let mainHtml = '';
    for (let i = 1; i <= mainLineCount; i++) {
        mainHtml += `<div>${i}</div>`;
    }
    gutter.innerHTML = mainHtml;

    if (overflowGutter) {
      let overflowHtml = '';
      for (let i = 1; i <= overflowLineCount; i++) {
          overflowHtml += `<div>${mainLineCount + i}</div>`;
      }
      overflowGutter.innerHTML = overflowHtml;
    }
  }
  
  window.pasteText = async () => {
    try {
      const t = await navigator.clipboard.readText();
      document.getElementById('mainText').value = t;
      window.onTextChange();
    } catch(e) { 
      showToast('Clipboard access denied'); 
    }
  };
  
  window.clearText = () => {
    document.getElementById('mainText').value = '';
    document.getElementById('overflowText').value = '';
    document.getElementById('overflowSection').style.display = 'none';
    window.onTextChange();
    ['segmentsOutput', 'uniqueWordsOutput', 'uniqueLinesOutput', 'frequencyOutput', 'transformOutput'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '';
    });
  };

  window.copyText = (text) => {
    navigator.clipboard.writeText(text).then(() => showToast('Copied!'));
  };

  window.copyAll = () => {
    window.copyText(state.text);
  };

  window.downloadTxt = () => {
    if (!state.text) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([state.text], { type: 'text/plain' }));
    a.download = 'text.txt';
    a.click();
  };

  // Feature specific functions
  window.segmentText = () => {
    const len = parseInt(document.getElementById('segLen').value) || 500;
    const keepSent = document.getElementById('keepSentences').checked;
    const out = document.getElementById('segmentsOutput');
    
    const segments = segmentText(state.text, len, keepSent);
    
    if (segments.length === 0) {
      out.innerHTML = '<p style="color:var(--text3);font-size:13px;">No text provided.</p>';
      return;
    }

    let html = `<div style="font-size:12px; color:var(--text3); margin-bottom:10px;">Segmented into <strong style="color:var(--accent);">${segments.length}</strong> parts</div>`;
    segments.forEach((seg, i) => {
      const escapedSeg = JSON.stringify(seg);
      html += `<div class="segment-block">
        <div class="segment-meta">Segment ${i+1} / ${segments.length} &mdash; ${seg.length} characters &mdash; <button onclick='copyText(${escapedSeg})' style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:11px;font-family:inherit;padding:0;">copy</button></div>
        ${escHtml(seg)}
      </div>`;
    });
    
    const copyAllBtn = document.createElement('button');
    copyAllBtn.className = 'btn btn-ghost';
    copyAllBtn.style.marginTop = '4px';
    copyAllBtn.innerHTML = '<i data-lucide="copy" style="width:13px;height:13px;"></i> Copy All';
    copyAllBtn.onclick = () => window.copyText(segments.join('\n\n---\n\n'));
    
    out.innerHTML = html;
    out.appendChild(copyAllBtn);
    if (window.lucide) window.lucide.createIcons();
  };

  window.getUniqueWords = () => {
    const ci = document.getElementById('caseInsensitive').checked;
    const sp = document.getElementById('stripPunct').checked;
    const out = document.getElementById('uniqueWordsOutput');
    if (!state.text.trim()) { out.innerHTML = '<p style="color:var(--text3);font-size:13px;">No text provided.</p>'; return; }

    let words = state.text.trim().split(/\s+/).filter(w => w.length > 0);
    if (sp) words = words.map(w => w.replace(/[^\w]/g, ''));
    if (ci) words = words.map(w => w.toLowerCase());
    words = words.filter(w => w.length > 0);
    const unique = [...new Set(words)].sort();

    const result = unique.join('\n');
    let html = `<div style="font-size:12px; color:var(--text3); margin-bottom:10px;">
      <strong style="color:var(--accent);">${unique.length}</strong> unique words from ${words.length} total
      <button onclick='copyText(${JSON.stringify(result)})' style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:11px;margin-left:8px;">copy</button>
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:4px;">`;
    unique.forEach(w => { html += `<span class="chip">${escHtml(w)}</span>`; });
    html += '</div>';
    out.innerHTML = html;
  };

  window.getUniqueLines = () => {
    const sep = document.getElementById('lineSep').value;
    const trim = document.getElementById('trimLines').checked;
    const out = document.getElementById('uniqueLinesOutput');
    if (!state.text.trim()) { out.innerHTML = '<p style="color:var(--text3);font-size:13px;">No text provided.</p>'; return; }

    let parts;
    if (sep === 'newline') parts = state.text.split('\n');
    else if (sep === 'semicolon') parts = state.text.split(';');
    else if (sep === 'comma') parts = state.text.split(',');
    else parts = state.text.split(/[\n;,]/);

    if (trim) parts = parts.map(p => p.trim());
    parts = parts.filter(p => p.length > 0);
    const unique = [...new Set(parts)];
    const dupes = parts.length - unique.length;
    const result = unique.join('\n');

    let html = `<div style="font-size:12px; color:var(--text3); margin-bottom:10px;">
      <strong style="color:var(--accent);">${unique.length}</strong> unique / ${parts.length} total &mdash; <strong style="color:var(--danger);">${dupes}</strong> duplicates removed
      <button onclick='copyText(${JSON.stringify(result)})' style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:11px;margin-left:8px;">copy</button>
    </div><div class="output-box">${escHtml(unique.join('\n'))}</div>`;
    out.innerHTML = html;
  };

  window.getFrequency = () => {
    const top = parseInt(document.getElementById('freqTop').value) || 20;
    const sw = document.getElementById('freqStopwords').checked;
    const out = document.getElementById('frequencyOutput');
    if (!state.text.trim()) { out.innerHTML = '<p style="color:var(--text3);font-size:13px;">No text provided.</p>'; return; }

    let words = state.text.toLowerCase().split(/\s+/);
    words = words.map(w => w.replace(/[^\w]/g, '')).filter(w => w.length > 1);
    if (sw) words = words.filter(w => !STOPWORDS.has(w));

    const freq = {};
    for (const w of words) freq[w] = (freq[w] || 0) + 1;
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, top);
    const maxVal = sorted[0]?.[1] || 1;

    let html = `<div style="font-size:12px; color:var(--text3); margin-bottom:10px;">Top ${Math.min(top, sorted.length)} most frequent words</div>`;
    sorted.forEach(([word, count], i) => {
      const pct = Math.round((count / maxVal) * 100);
      html += `<div style="display:flex; align-items:center; gap:8px; padding:4px 0; border-bottom:1px solid var(--border);">
        <span style="font-size:11px; color:var(--text3); width:20px; text-align:right; font-family:'JetBrains Mono';">${i + 1}</span>
        <span style="font-size:13px; font-family:'JetBrains Mono'; flex:1;">${escHtml(word)}</span>
        <div style="width:80px; background:var(--bg4); border-radius:2px; height:4px;">
          <div style="width:${pct}%;height:4px;background:var(--accent);border-radius:2px;"></div>
        </div>
        <span style="font-size:12px; font-weight:600; font-family:'JetBrains Mono'; color:var(--accent); min-width:28px; text-align:right;">${count}</span>
      </div>`;
    });
    out.innerHTML = html;
  };

  window.transform = (type) => {
    const out = document.getElementById('transformOutput');
    if (!state.text) { out.innerHTML = '<p style="color:var(--text3);font-size:13px;">No text provided.</p>'; return; }
    
    const transformFn = transforms[type];
    if (!transformFn) return;
    
    const result = transformFn(state.text);
    const labels = {
      upper: 'UPPERCASE',
      lower: 'lowercase',
      title: 'Title Case',
      sentence: 'Sentence case',
      reverse: 'Reverse',
      reversewords: 'Reverse words',
      removeExtraSpaces: 'Remove extra spaces',
      removeDuplicateLines: 'Remove duplicate lines',
      removeEmptyLines: 'Remove empty lines',
      sortLines: 'Sort lines A-Z',
      slugify: 'Slugify (URL)',
      extractEmails: 'Extract emails',
      extractUrls: 'Extract URLs',
      extractNumbers: 'Extract numbers'
    };
    
    const label = labels[type] || type;

    out.innerHTML = `<div style="font-size:12px; color:var(--text3); margin-bottom:8px; display:flex; align-items:center; justify-content:space-between;">
      <span><strong style="color:var(--accent);">${label}</strong></span>
      <div style="display:flex; gap:6px;">
        <button id="applyTransformBtn" class="btn btn-ghost" style="font-size:11px; padding:4px 10px;">
          <i data-lucide="check" style="width:11px;height:11px;"></i> Apply
        </button>
        <button onclick='copyText(${JSON.stringify(result)})' class="btn btn-ghost" style="font-size:11px; padding:4px 10px;">
          <i data-lucide="copy" style="width:11px;height:11px;"></i> Copy
        </button>
      </div>
    </div>
    <div class="output-box">${escHtml(result)}</div>`;
    
    document.getElementById('applyTransformBtn').onclick = () => {
      document.getElementById('mainText').value = result;
      window.onTextChange();
      showToast('Applied!');
    };
    
    if (window.lucide) window.lucide.createIcons();
  };

  // Sync scroll between textarea, highlights, and gutter
  const textarea = document.getElementById('mainText');
  const backdrop = document.querySelector('.editor-backdrop');
  const gutter = document.getElementById('gutter');
  
  textarea.addEventListener('scroll', () => {
    if (backdrop) {
      backdrop.scrollTop = textarea.scrollTop;
      backdrop.scrollLeft = textarea.scrollLeft;
    }
    if (gutter) {
      gutter.scrollTop = textarea.scrollTop;
    }
  });

  const overflowTextarea = document.getElementById('overflowText');
  const overflowGutter = document.getElementById('overflowGutter');
  if (overflowTextarea && overflowGutter) {
    overflowTextarea.addEventListener('scroll', () => {
      overflowGutter.scrollTop = overflowTextarea.scrollTop;
    });
  }

  window.addEventListener('resize', handleResize);
  handleResize();
  updateLineNumbers();
}

/**
 * Updates text statistics in the UI.
 */
function updateStats() {
  const stats = calculateStats(state.text);
  if (!stats) {
    resetStatsDisplay();
    return;
  }

  updateEl('s-chars', stats.chars.toLocaleString('en'));
  updateEl('s-chars-ns', stats.charsNS.toLocaleString('en'));
  updateEl('s-words', stats.wordCount.toLocaleString('en'));
  updateEl('s-sentences', stats.sentences);
  updateEl('s-paragraphs', stats.paragraphs);
  updateEl('s-lines', stats.lines);
  updateEl('s-unique', stats.uniqueWords);
  updateEl('s-avgword', stats.avgWordLen + ' ch.');
  updateEl('s-avgsen', stats.avgSenLen + ' words');
  updateEl('s-flesch', stats.flesch !== null ? stats.flesch + (stats.flesch >= 70 ? ' (easy)' : stats.flesch >= 50 ? ' (medium)' : ' (hard)') : '–');
  updateEl('s-readtime', formatTime(stats.readTimeSec));
  updateEl('s-speaktime', formatTime(stats.speakTimeSec));
  updateEl('s-upper', stats.upper);
  updateEl('s-digits', stats.digits);
  updateEl('s-bytes', formatBytes(stats.bytes));
}

/**
 * Updates the character limit bar.
 */
function updateLimitBar() {
  const limitInput = document.getElementById('limitInput');
  const limit = parseInt(limitInput.value);
  const wrap = document.getElementById('limitBarWrap');
  const bar = document.getElementById('limitBar');
  const info = document.getElementById('limitInfo');
  const warn = document.getElementById('limitWarning');

  if (!limit || isNaN(limit) || limit <= 0) {
    wrap.style.display = 'none';
    info.textContent = '';
    warn.style.display = 'none';
    return;
  }

  const len = state.text.length;
  const pct = Math.min((len / limit) * 100, 100);
  const over = len > limit;
  const overflowSection = document.getElementById('overflowSection');

  wrap.style.display = 'block';
  bar.style.width = pct + '%';
  bar.style.background = over ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : 'var(--accent)';
  info.textContent = `${len.toLocaleString('en')} / ${limit.toLocaleString('en')} ch.`;
  info.style.color = over ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : 'var(--text2)';
  warn.style.display = over ? 'block' : 'none';

  if (over) {
    overflowSection.style.display = 'block';
    document.getElementById('overflowCount').textContent = `(+${(len - limit).toLocaleString('en')} extra)`;
  } else if (document.getElementById('overflowText').value.length === 0) {
    overflowSection.style.display = 'none';
  }

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Handles layout adjustments on resize.
 */
function handleResize() {
  const grid = document.querySelector('.main-grid');
  if (!grid) return;
  if (window.innerWidth < 720) {
    grid.style.gridTemplateColumns = '1fr';
  } else {
    grid.style.gridTemplateColumns = '1fr 340px';
  }
}

document.addEventListener('DOMContentLoaded', init);
window.updateLimitBar = updateLimitBar; 
