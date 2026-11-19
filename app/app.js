// GTA VI trophy guide & tracker: checklist saved in localStorage, export/import, kind
// filters, grade filter, search, and a spoiler-free mode that hides story trophies
// until they are earned. All data is local (data/trophies.json); no network requests.
const EARNED_KEY = 'gta6-trophy-earned';
const SPOILER_KEY = 'gta6-trophy-spoiler';
const KINDS = [
  ['all', 'All'],
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['collectible', 'Collectibles'],
  ['activity', 'Activities'],
  ['crime', 'Crime'],
  ['online', 'Online'],
];
const KIND_LABEL = { story: 'Story', collectible: 'Collectible', activity: 'Activity', crime: 'Crime', platinum: 'Platinum', completion: '100% completion' };

// Roadmap to the platinum, built from the official descriptions: story first (no
// mission replay), then strangers, crime, activities, collectibles, and 100% cleanup.
const ROADMAP = [
  { n: 1, title: 'Story first — Chapters 1–4 and the final mission', text: 'Play the main missions in order. Save manually at the start of every chapter and before the final mission: there is no mission replay. Do Lucia\u2019s balcony meditation in Chapter 1 while you are there.', count: '18 story trophies' },
  { n: 2, title: 'Stranger missions', text: 'Finish the stranger strands for Andy, Kenton, Billy, Randy and Tyrone, plus 8 strands in total across Leonida. New markers appear after each story chapter.', count: '6 trophies' },
  { n: 3, title: 'Free-roam crime', text: 'Bank vaults, armored trucks, jewelry stores, gang operations and wanted-level escapes. Most of these open up in Chapters 3–4, and all are retryable in free roam.', count: '9 trophies' },
  { n: 4, title: 'Activities & challenges', text: 'Races, fishing, arcade games, bowling, the shooting range (42 gold medals), 250 stunts and 50 challenges. Sample every activity type once early for Master of None.', count: '19 trophies' },
  { n: 5, title: 'Collectibles & money', text: 'Meditation spots (finish them before leaving Chapter 1), card sets, WAiNK spots, 100 vehicles, garage properties, laundering marked bills and spending $100,000.', count: '7 trophies' },
  { n: 6, title: 'Cleanup & 100%', text: 'Sweep the map for unexplored regions, then finish the game\u2019s 100% completion checklist for A Long Road. The platinum, Vice Got a Price!, unlocks with the last trophy.', count: '2 trophies' },
];

const params = new URLSearchParams(location.search);
const grid = document.getElementById('grid');
const statusEl = document.getElementById('status');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const earnedOnlyEl = document.getElementById('earnedOnly');
const spoilerEl = document.getElementById('spoiler');

let trophies = [];
let earned = new Set(loadEarned());
let kindFilter = params.get('kind') && KINDS.some(([k]) => k === params.get('kind')) ? params.get('kind') : 'all';
let spoilerOn = params.get('spoiler') === 'off' ? false : loadSpoiler();

// Demo mode (?demo=1) ticks a few trophies in memory only, for screenshots; it never writes to localStorage.
const DEMO_EARNED = ['Just Like Paradise', 'Paradise Lost', 'Vice Got a Price!'];
if (params.get('demo') === '1') for (const n of DEMO_EARNED) earned.add(n);

function loadEarned() {
  try { const v = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]'); return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []; }
  catch { return []; }
}
function loadSpoiler() {
  const v = localStorage.getItem(SPOILER_KEY);
  return v === null ? true : v === '1';
}
function saveEarned() {
  if (params.get('demo') === '1') return; // demo ticks stay in memory only
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
}
function saveSpoiler() { localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0'); }

function gradeCounts() {
  const c = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (earned.has(t.name)) c[t.grade] = (c[t.grade] || 0) + 1;
  return c;
}

function isHidden(t) { return spoilerOn && t.kind === 'story' && !earned.has(t.name); }

function matches(t) {
  if (kindFilter === 'story' && t.kind !== 'story') return false;
  if (kindFilter === 'missable' && !t.missable) return false;
  if (kindFilter === 'collectible' && t.kind !== 'collectible') return false;
  if (kindFilter === 'activity' && t.kind !== 'activity') return false;
  if (kindFilter === 'crime' && t.kind !== 'crime') return false;
  if (kindFilter === 'online') return false; // the game lists no online trophies
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (earnedOnlyEl.checked && !earned.has(t.name)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
  return true;
}

function tag(text, cls) { const s = document.createElement('span'); s.className = 'tag ' + (cls || ''); s.textContent = text; return s; }

function renderCard(t) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(t.name) ? ' earned' : '');
  card.dataset.name = t.name;
  const tick = document.createElement('label');
  tick.className = 'tick';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', 'Earned: ' + t.name);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name); else earned.delete(t.name);
    saveEarned();
    render();
  });
  tick.append(box, document.createTextNode(earned.has(t.name) ? 'Earned' : 'Mark as earned'));
  card.append(tick);

  if (isHidden(t)) {
    card.classList.add('hidden-card');
    const lock = document.createElement('div'); lock.className = 'lock'; lock.textContent = '\uD83D\uDD12';
    const h = document.createElement('h3'); h.textContent = 'Hidden story trophy';
    const p = document.createElement('p');
    p.textContent = 'PlayStation hides this story trophy until it is earned. Spoiler-free mode is on — tick the box above once you earn it to reveal its name and guide.';
    card.append(lock, h, p);
    return card;
  }

  const tags = document.createElement('div');
  tags.className = 'tags';
  tags.append(tag(t.grade, t.grade));
  tags.append(tag(KIND_LABEL[t.kind] || t.kind, 'kind-' + t.kind));
  if (t.missable) tags.append(tag('Missable', 'missable'));
  card.append(tags);

  const h = document.createElement('h3'); h.textContent = t.name; card.append(h);
  const desc = document.createElement('p'); desc.className = 'desc'; desc.textContent = t.description; card.append(desc);
  if (t.target) { const tg = document.createElement('p'); tg.className = 'target'; tg.textContent = 'Target: ' + t.target.toLocaleString('en-US'); card.append(tg); }
  const guide = document.createElement('p'); guide.className = 'guide'; guide.textContent = t.guide; card.append(guide);
  const src = document.createElement('p'); src.className = 'src'; src.textContent = 'Source: ' + t.source; card.append(src);
  return card;
}

function renderRoadmap() {
  const ol = document.getElementById('stages');
  ol.replaceChildren();
  for (const s of ROADMAP) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    const n = document.createElement('span'); n.className = 'n'; n.textContent = 'Stage ' + s.n;
    h.append(n, document.createTextNode(s.title));
    const p = document.createElement('p'); p.textContent = s.text + ' ';
    const c = document.createElement('span'); c.className = 'tcount'; c.textContent = s.count + '.';
    p.append(c);
    li.append(h, p);
    ol.append(li);
  }
}

function renderKindChips() {
  const wrap = document.getElementById('kindChips');
  wrap.replaceChildren();
  for (const [key, label] of KINDS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label + (key === 'online' ? ' (0)' : '');
    b.setAttribute('aria-pressed', kindFilter === key ? 'true' : 'false');
    b.addEventListener('click', () => { kindFilter = key; render(); });
    wrap.append(b);
  }
}

function render() {
  const shown = trophies.filter(matches);
  grid.replaceChildren();
  if (!shown.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = kindFilter === 'online'
      ? 'No online trophies: all 55 trophies are single-player. (Source: Output Lag / Leonida Hub.)'
      : 'No trophies match these filters.';
    grid.append(p);
  } else {
    for (const t of shown) grid.append(renderCard(t));
  }
  document.getElementById('earnedCount').textContent = String(earned.size);
  const c = gradeCounts();
  document.getElementById('gradeCounts').textContent =
    `Platinum ${c.platinum}/1 · Gold ${c.gold}/2 · Silver ${c.silver}/6 · Bronze ${c.bronze}/46`;
  document.getElementById('barFill').style.width = (earned.size / trophies.length * 100) + '%';
  document.getElementById('bar').setAttribute('aria-valuenow', String(earned.size));
  document.getElementById('resultLine').textContent =
    `Showing ${shown.length} of ${trophies.length} trophies` + (spoilerOn ? ' · spoiler-free mode on' : '');
  renderKindChips();
  spoilerEl.checked = spoilerOn;
  const focusId = params.get('focus');
  if (focusId) {
    const el = grid.querySelector(`[data-name="${CSS.escape(trophies[Number(focusId) - 1]?.name || '')}"]`);
    // Delay the scroll a beat so the grid has laid out before we jump to the card.
    if (el) { el.classList.add('focused'); setTimeout(() => el.scrollIntoView({ block: 'center' }), 300); }
  }
}

function flash(msg) { statusEl.textContent = msg; setTimeout(() => { statusEl.textContent = ''; }, 4000); }

document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
  flash('Exported ' + earned.size + ' earned trophies.');
});

document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('bad file');
    const known = new Set(trophies.map((t) => t.name));
    const good = names.filter((n) => typeof n === 'string' && known.has(n));
    earned = new Set(good);
    saveEarned();
    render();
    flash('Imported ' + good.length + ' earned trophies' + (names.length - good.length ? ' (' + (names.length - good.length) + ' unknown names skipped)' : '') + '.');
  } catch {
    flash('Import failed: that file is not a trophy-progress export.');
  }
  e.target.value = '';
});

document.getElementById('reset').addEventListener('click', () => {
  if (!earned.size) return;
  earned = new Set();
  saveEarned();
  render();
  flash('Checklist reset.');
});

searchEl.addEventListener('input', render);
gradeEl.addEventListener('change', render);
earnedOnlyEl.addEventListener('change', render);
spoilerEl.addEventListener('change', () => { spoilerOn = spoilerEl.checked; saveSpoiler(); render(); });

const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies;
renderRoadmap();
render();
if (params.get('roadmap') === '1') setTimeout(() => document.getElementById('roadmap').scrollIntoView(), 300);
