const DEFAULTS = {
  autoSetYear: true,
  targetYear: '2025-2026',
  addNewTabButtons: true,
  debug: false,
};

const $auto = document.getElementById('autoSetYear');
const $year = document.getElementById('targetYear');
const $newTab = document.getElementById('addNewTabButtons');
const $debug = document.getElementById('debug');
const $saved = document.getElementById('saved');

async function load() {
  const s = await chrome.storage.sync.get(DEFAULTS);
  $auto.checked = s.autoSetYear;
  $year.value = s.targetYear;
  $newTab.checked = s.addNewTabButtons;
  $debug.checked = s.debug;
}

let savedTimer;
async function save() {
  await chrome.storage.sync.set({
    autoSetYear: $auto.checked,
    targetYear: $year.value.trim() || DEFAULTS.targetYear,
    addNewTabButtons: $newTab.checked,
    debug: $debug.checked,
  });
  $saved.textContent = 'Opgeslagen';
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => ($saved.textContent = ''), 1500);
}

$auto.addEventListener('change', save);
$newTab.addEventListener('change', save);
$debug.addEventListener('change', save);
$year.addEventListener('change', save);
$year.addEventListener('blur', save);

load();
