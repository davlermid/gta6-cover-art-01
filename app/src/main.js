// Neon Shore Cover Studio — wires the editor UI, panel interaction, undo/redo, export and shot scenes.
import { renderCover, exportPNG, whenFontsReady } from './render.js';
import { GRADES, GRADE_IDS } from './grades.js';
import { LAYOUTS, LAYOUT_IDS } from './layouts.js';
import {
  SAMPLES, defaultState, makeHistory, setPanelImage,
  updatePanel,
} from './state.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const $ = (id) => document.getElementById(id);

const history = makeHistory(defaultState());
let selected = 0;
let thumbs = []; // {img, name, source}

function state() { return history.get(); }
function commit(next) { history.set(next); syncUI(); draw(); }
function draw() { renderCover(canvas, state()); }

/* ---------- init panels with sample photos so the first screen shows a finished cover ---------- */
async function preloadSamples() {
  const imgs = await Promise.all(SAMPLES.map((s) => loadImage(s.file).catch(() => null)));
  thumbs = SAMPLES.map((s, i) => ({ img: imgs[i], name: s.name })).filter((t) => t.img);
  // Spread photos across the panels of the default layout
  let s = state();
  const n = LAYOUTS[s.layout].panels;
  for (let i = 0; i < n; i++) {
    const t = thumbs[i % Math.max(thumbs.length, 1)];
    if (t) s = setPanelImage(s, i, t.img);
  }
  history.set(s);
  renderThumbs();
  draw();
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/* ---------- thumbnail library ---------- */
function renderThumbs(activeIdx = -1) {
  const el = $('thumbs');
  el.textContent = '';
  thumbs.forEach((t, i) => {
    const img = document.createElement('img');
    img.src = t.img.src;
    img.title = `Add "${t.name}" to selected panel`;
    if (i === activeIdx) img.classList.add('active');
    img.addEventListener('click', () => {
      const s = setPanelImage(state(), selected, t.img);
      commit(s);
      flash(`Added "${t.name}" to panel ${selected + 1}`);
    });
    el.appendChild(img);
  });
}

/* ---------- files: multi-upload + drag and drop ---------- */
async function addFiles(files) {
  const list = [...files].filter((f) => f.type.startsWith('image/'));
  for (const f of list) {
    const img = await loadImage(URL.createObjectURL(f));
    thumbs.push({ img, name: f.name.replace(/\.[^.]+$/, '') });
  }
  if (list.length) {
    const s = setPanelImage(state(), selected, thumbs[thumbs.length - 1].img);
    commit(s);
    flash(`Added ${list.length} photo${list.length > 1 ? 's' : ''}`);
    renderThumbs();
  }
}
$('photo').addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
const dz = $('dropzone');
dz.addEventListener('click', () => $('photo').click());
['dragover', 'dragenter'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
dz.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));
// Also allow dropping anywhere on the stage
$('stage').addEventListener('dragover', (e) => e.preventDefault());
$('stage').addEventListener('drop', (e) => { e.preventDefault(); if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files); });

/* ---------- panel picking / dragging / zooming ---------- */
let panelRects = [];
function computePanelRects() {
  const s = state();
  const layout = LAYOUTS[s.layout];
  const gap = s.gap / 100;
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  panelRects = [];
  for (let i = 0; i < layout.panels; i++) {
    const r = layout.rects(i);
    const gx = gap / 2;
    panelRects.push({ x: (r.x + gx) * W, y: (r.y + gap / 2) * H, w: (r.w - 2 * gx) * W, h: (r.h - gap) * H, tilt: r.tilt || 0 });
  }
}

function pickPanel(mx, my) {
  computePanelRects();
  // Ignore tilt for hit tests (close enough visually)
  for (let i = 0; i < panelRects.length; i++) {
    const r = panelRects[i];
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) return i;
  }
  return -1;
}

function canvasPos(e) {
  const b = canvas.getBoundingClientRect();
  return { mx: ((e.clientX - b.left) / b.width) * canvas.clientWidth, my: ((e.clientY - b.top) / b.height) * canvas.clientHeight };
}

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const { mx, my } = canvasPos(e);
  const idx = pickPanel(mx, my);
  if (idx === -1) return;
  selected = idx;
  renderThumbs();
  syncPanelControls();
  const r = panelRects[idx];
  drag = { idx, sx: mx, sy: my, pan: { ...(state().panels[idx]?.pan || { x: 0, y: 0 }) }, moved: false };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const { mx, my } = canvasPos(e);
  const dx = (mx - drag.sx) / panelRects[drag.idx].w;
  const dy = (my - drag.sy) / panelRects[drag.idx].h;
  if (Math.abs(dx) + Math.abs(dy) > 0.005) drag.moved = true;
  const pan = { x: clamp(drag.pan.x + dx, -0.6, 0.6), y: clamp(drag.pan.y + dy, -0.6, 0.6) };
  history.set(updatePanel(state(), drag.idx, { pan }));
  draw();
});
canvas.addEventListener('pointerup', () => {
  if (drag && drag.moved) { /* already applied via set; snap history */ }
  else if (drag) history.set(state()); // no-op click
  drag = null;
});
canvas.addEventListener('wheel', (e) => {
  const { mx, my } = canvasPos(e);
  const idx = pickPanel(mx, my);
  if (idx === -1) return;
  e.preventDefault();
  selected = idx;
  renderThumbs();
  syncPanelControls();
  const cur = state().panels[idx]?.zoom ?? 1;
  const zoom = clamp(cur * (e.deltaY < 0 ? 1.08 : 0.93), 1, 4);
  commit(updatePanel(state(), idx, { zoom }));
}, { passive: false });
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------- layout & grade chips ---------- */
function buildChips(el, ids, current, labels, onPick) {
  el.textContent = '';
  ids.forEach((id) => {
    const b = document.createElement('button');
    b.className = 'chip' + (id === current ? ' active' : '');
    b.textContent = labels[id];
    b.addEventListener('click', () => onPick(id));
    el.appendChild(b);
  });
}
function renderLayoutChips() {
  buildChips($('layouts'), LAYOUT_IDS, state().layout, Object.fromEntries(LAYOUT_IDS.map((id) => [id, LAYOUTS[id].name])), (id) => {
    const s = state();
    const n = LAYOUTS[id].panels;
    let next = { ...s, layout: id, panels: s.panels.slice() };
    for (let i = 0; i < n; i++) {
      if (!next.panels[i]) {
        const t = thumbs[i % Math.max(thumbs.length, 1)];
        if (t) next = setPanelImage(next, i, t.img);
      }
    }
    commit(next);
  });
}
function renderGradeChips() {
  buildChips($('grades'), GRADE_IDS, state().grade, Object.fromEntries(GRADE_IDS.map((id) => [id, GRADES[id].name])), (id) => commit({ ...state(), grade: id }));
  const sel = $('panelGrade');
  sel.textContent = '';
  for (const id of GRADE_IDS) {
    const o = document.createElement('option');
    o.value = id;
    o.textContent = GRADES[id].name;
    sel.appendChild(o);
  }
}

/* ---------- stars ---------- */
function renderStars() {
  const el = $('stars');
  el.textContent = '';
  for (let i = 1; i <= 5; i++) {
    const b = document.createElement('button');
    b.textContent = '★';
    if (i <= state().stars) b.classList.add('lit');
    b.title = `${i} star${i > 1 ? 's' : ''} of heat`;
    b.addEventListener('click', () => commit({ ...state(), stars: i }));
    el.appendChild(b);
  }
}

/* ---------- plain control bindings ---------- */
function bindInput(id, key, transform = (v) => v, after = null) {
  const el = $(id);
  el.addEventListener('input', () => {
    history.set({ ...state(), [key]: transform(el.value) });
    draw();
    if (after) after();
  });
  el.addEventListener('change', () => {
    // push a proper undo point on commit-ish changes
    history.set(state());
  });
}
bindInput('title', 'title');
bindInput('subtitle', 'subtitle');
bindInput('badgeText', 'badgeText');
bindInput('titleSize', 'titleSize', Number, () => { $('titleSizeVal').textContent = state().titleSize; });
bindInput('titleY', 'titleY', Number, () => { $('titleYVal').textContent = state().titleY; });
bindInput('gap', 'gap', Number, () => { $('gapVal').textContent = state().gap; });
$('titleStyle').addEventListener('change', (e) => commit({ ...state(), titleStyle: e.target.value }));
$('border').addEventListener('change', (e) => commit({ ...state(), border: e.target.value }));
$('badge').addEventListener('change', (e) => commit({ ...state(), badge: e.target.checked }));
$('halftone').addEventListener('change', (e) => commit({ ...state(), halftone: e.target.checked }));
$('grain').addEventListener('change', (e) => commit({ ...state(), grain: e.target.checked }));
$('vignette').addEventListener('change', (e) => commit({ ...state(), vignette: e.target.checked }));
$('panelGradeToggle').addEventListener('change', (e) => {
  const sel = $('panelGrade');
  sel.disabled = !e.target.checked;
  commit(updatePanel(state(), selected, { grade: e.target.checked ? sel.value : null }));
});
$('panelGrade').addEventListener('change', (e) => {
  if (!$('panelGradeToggle').checked) return;
  commit(updatePanel(state(), selected, { grade: e.target.value || null }));
});

/* ---------- selection-aware control sync ---------- */
function syncPanelControls() {
  const p = state().panels[selected];
  $('panelGradeToggle').checked = !!(p && p.grade);
  $('panelGrade').disabled = !(p && p.grade);
  if (p && p.grade) $('panelGrade').value = p.grade;
}

/* ---------- undo / redo / randomize / reset ---------- */
$('undo').addEventListener('click', () => { history.undo(); syncUI(); draw(); });
$('redo').addEventListener('click', () => { history.redo(); syncUI(); draw(); });
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    if (e.shiftKey) history.redo();
    else history.undo();
    syncUI(); draw();
  }
});

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
$('randomize').addEventListener('click', () => {
  const layoutId = pick(LAYOUT_IDS.filter((l) => l !== 'full-bleed'));
  const n = LAYOUTS[layoutId].panels;
  let s = { ...defaultState(), layout: layoutId, grade: pick(GRADE_IDS), titleStyle: pick(['sunset', 'white']) };
  const names = pick(TITLES);
  s.title = names[0];
  s.subtitle = names[1];
  s.badgeText = pick(BADGES);
  s.stars = 2 + Math.floor(Math.random() * 4);
  s.panels = [];
  const shuffled = thumbs.slice().sort(() => Math.random() - 0.5);
  for (let i = 0; i < n; i++) {
    const t = shuffled[i % Math.max(shuffled.length, 1)];
    if (t) s = setPanelImage(s, i, t.img);
  }
  commit(s);
  flash(`Randomized: ${LAYOUTS[layoutId].name} · ${GRADES[s.grade].name}`);
});
$('reset').addEventListener('click', () => { commit(defaultState()); preloadSamples(); flash('Reset to the default cover'); });

const TITLES = [['NEON SHORE', 'a vice city story'], ['NIGHT SHIFT', 'streets after midnight'], ['PIER PRESSURE', 'salt, neon & sin'], ['SUNSET HEIST', 'one last drive'], ['BOULEVARD QUEEN', 'palm lines & chrome'], ['MIDNIGHT FEVER', 'run till sunrise']];
const BADGES = ['City of Dreams', 'Wanted', 'Est. 1986', 'No Rules', ' Vice City', 'Out All Night'];

/* ---------- export ---------- */
document.querySelectorAll('.exports button').forEach((b) => {
  b.addEventListener('click', () => {
    const w = Number(b.dataset.w);
    const h = Number(b.dataset.h);
    const name = `${slug(state().title || 'cover')}-${w}x${h}.png`;
    exportPNG(state(), w, h, name);
    flash(`Saved ${name}`);
  });
});
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cover';
function flash(msg) { status.textContent = msg; setTimeout(() => { if (status.textContent === msg) status.textContent = ''; }, 3000); }

/* ---------- full UI sync ---------- */
function syncUI() {
  const s = state();
  renderLayoutChips();
  renderGradeChips();
  renderStars();
  const map = {
    title: s.title, subtitle: s.subtitle, badgeText: s.badgeText, titleStyle: s.titleStyle,
    titleSize: s.titleSize, titleY: s.titleY, gap: s.gap, border: s.border, badge: s.badge,
    halftone: s.halftone, grain: s.grain, vignette: s.vignette,
  };
  for (const [id, v] of Object.entries(map)) {
    const el = $(id);
    if (el.type === 'checkbox') el.checked = v;
    else el.value = v;
  }
  $('titleSizeVal').textContent = s.titleSize;
  $('titleYVal').textContent = s.titleY;
  $('gapVal').textContent = s.gap;
  $('undo').disabled = !history.canUndo();
  $('redo').disabled = !history.canRedo();
  syncPanelControls();
}

/* ---------- shot scenes for deterministic screenshots ---------- */
async function applyShotScene(query) {
  const photoName = query.get('photo') || 'pier';
  const file = SAMPLES.find((x) => x.file.includes(photoName))?.file ?? `samples/${photoName}.jpg`;
  const img = await loadImage(file).catch(() => null);
  const caption = query.get('caption') || 'Sunset Heist';
  let s = { ...defaultState() };
  s.title = caption;
  s.subtitle = query.get('subtitle') || 'a neon shore story';
  if (query.get('layout')) s.layout = query.get('layout');
  if (query.get('grade')) s.grade = query.get('grade');
  if (query.get('size')) s.titleSize = Number(query.get('size'));
  if (query.get('stars')) s.stars = Number(query.get('stars'));
  const n = LAYOUTS[s.layout].panels;
  const list = query.get('photos')
    ? query.get('photos').split(',').map((x) => x.trim())
    : [photoName];
  for (let i = 0; i < n; i++) {
    const name = list[i % list.length];
    const im = name === photoName && img ? img
      : await loadImage(SAMPLES.find((x) => x.file.includes(name))?.file ?? `samples/${name}.jpg`).catch(() => img);
    if (im) s = setPanelImage(s, i, im);
  }
  history.set(s);
  syncUI();
  draw();
}

/* ---------- boot ---------- */
window.addEventListener('resize', draw);

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) document.body.classList.add(shot === 'cover' ? 'shot-cover' : 'shot-editor');

whenFontsReady().then(async () => {
  if (shot) {
    await applyShotScene(params);
    await runShot(shot, params);
  } else {
    await preloadSamples();
    syncUI();
    draw();
  }
});
