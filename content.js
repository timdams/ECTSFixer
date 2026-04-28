const DEFAULTS = {
  autoSetYear: true,
  targetYear: '2025-2026',
  addNewTabButtons: true,
  debug: false,
};

const LOG = (...a) => console.log('[ECTSFixer]', ...a);
const delay = (ms) => new Promise(r => setTimeout(r, ms));

function visible(el) {
  if (!el || !el.getBoundingClientRect) return false;
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return false;
  const cs = getComputedStyle(el);
  return cs.visibility !== 'hidden' && cs.display !== 'none';
}

// ---------- academiejaar dropdown ----------

function targetRegex(targetYear) {
  const m = String(targetYear).match(/(\d{4})\D+(\d{2,4})/);
  if (!m) return /__nope__/;
  const a = m[1];
  const bShort = m[2].slice(-2);
  return new RegExp(`(?:^|[^\\d])${a}\\s*[-\\/]\\s*(?:20)?${bShort}(?:[^\\d]|$)`);
}

const ANY_YEAR_RE = /(?:^|[^\d])20\d{2}\s*[-\/]\s*(?:20)?\d{2}(?:[^\d]|$)/;

function findYearTrigger() {
  const selectors = [
    '[role="combobox"]',
    'p-dropdown', 'p-select',
    '.p-dropdown', '.p-select',
    '.ng-select', '.mat-select-trigger',
  ];
  for (const sel of selectors) {
    for (const el of document.querySelectorAll(sel)) {
      if (!visible(el)) continue;
      const txt = (el.textContent || '').trim();
      if (txt.length === 0 || txt.length > 80) continue;
      if (ANY_YEAR_RE.test(txt)) return el;
    }
  }
  return null;
}

function fireClick(el) {
  try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (_) {}
  const opts = { bubbles: true, cancelable: true, view: window, button: 0 };
  try { el.dispatchEvent(new MouseEvent('pointerdown', opts)); } catch (_) {}
  try { el.dispatchEvent(new MouseEvent('mousedown', opts)); } catch (_) {}
  try { el.dispatchEvent(new MouseEvent('pointerup', opts)); } catch (_) {}
  try { el.dispatchEvent(new MouseEvent('mouseup', opts)); } catch (_) {}
  try { el.click(); } catch (_) {}
}

async function waitForOption(re, timeoutMs = 4000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const opts = document.querySelectorAll(
      '[role="option"], .p-dropdown-item, .p-select-option, .ng-option'
    );
    for (const o of opts) {
      if (!visible(o)) continue;
      const t = (o.textContent || '').trim();
      if (re.test(t)) return o;
    }
    await delay(80);
  }
  return null;
}

let yearBusy = false;
let yearDone = false;

async function tryYear(settings) {
  if (yearBusy || yearDone) return;
  yearBusy = true;
  try {
    const tr = targetRegex(settings.targetYear);
    const trigger = findYearTrigger();
    if (!trigger) return;
    const cur = (trigger.textContent || '').trim();
    if (tr.test(cur)) { yearDone = true; return; }
    if (settings.debug) LOG('opening dropdown, current:', cur);
    fireClick(trigger);
    await delay(150);
    const opt = await waitForOption(tr, 3500);
    if (!opt) return;
    if (settings.debug) LOG('clicking option:', opt.textContent.trim());
    fireClick(opt);
    yearDone = true;
  } catch (e) {
    if (settings.debug) LOG('tryYear error:', e);
  } finally {
    yearBusy = false;
  }
}

async function runYearLoop(settings) {
  if (!settings.autoSetYear) return;
  await delay(800);
  const start = Date.now();
  while (!yearDone && Date.now() - start < 30000) {
    await tryYear(settings);
    if (yearDone) break;
    await delay(500);
  }
  if (settings.debug && !yearDone) LOG('year loop gave up');
}

// ---------- open in nieuwe tab knoppen ----------

const BTN_CLASS = 'ectsfixer-open-tab-btn';
const BTN_STYLE_ID = 'ectsfixer-style';
const ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M14 3h7v7"/><path d="M21 3l-9 9"/>
  <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>
</svg>`;

function injectStyle() {
  if (document.getElementById(BTN_STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = BTN_STYLE_ID;
  s.textContent = `
.${BTN_CLASS} {
  margin-left: 8px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #444;
  transition: background .15s, color .15s, border-color .15s;
  flex-shrink: 0;
}
.${BTN_CLASS}:hover {
  background: #fff5f5;
  color: #d90005;
  border-color: #d90005;
}
`;
  document.head.appendChild(s);
}

function decorateOne(div) {
  if (div.dataset.ectsfixerEnhanced === '1') return;
  // Alleen vak-callouts (de container-callout heeft 'linkEffect' niet)
  if (!div.classList.contains('linkEffect')) return;

  div.dataset.ectsfixerEnhanced = '1';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = BTN_CLASS;
  btn.title = 'Open in nieuwe tab';
  btn.setAttribute('aria-label', 'Open in nieuwe tab');
  btn.innerHTML = ICON_SVG;

  const stop = (e) => { e.stopPropagation(); };
  btn.addEventListener('pointerdown', stop, true);
  btn.addEventListener('mousedown', stop, true);
  btn.addEventListener('mouseup', stop, true);

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('ECTSFIXER_PREP_NEW_TAB'));
    // Trigger Angular's klik-handler op de div
    setTimeout(() => fireClick(div), 0);
  }, true);

  div.appendChild(btn);
}

function decorateAll() {
  const divs = document.querySelectorAll('div.bs-callout.linkEffect');
  for (const d of divs) decorateOne(d);
}

let decorateTimer;
function scheduleDecorate() {
  clearTimeout(decorateTimer);
  decorateTimer = setTimeout(() => {
    try { decorateAll(); } catch (_) {}
  }, 80);
}

function startNewTabButtons(settings) {
  if (!settings.addNewTabButtons) return;
  injectStyle();
  decorateAll();

  // Volg verdere DOM-mutaties (accordion openen, route-wijzigingen) met
  // een gedebouncede observer; idempotent dankzij de data-attribuut.
  const obs = new MutationObserver(() => scheduleDecorate());
  obs.observe(document.body, { childList: true, subtree: true });
}

// ---------- main ----------

(async () => {
  let settings;
  try {
    settings = await chrome.storage.sync.get(DEFAULTS);
  } catch (_) {
    settings = DEFAULTS;
  }
  if (settings.debug) LOG('booting on', location.href, settings);

  // Beide features parallel starten; ze hinderen elkaar niet.
  runYearLoop(settings).catch(e => settings.debug && LOG('year fatal', e));
  startNewTabButtons(settings);
})();
