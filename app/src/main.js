// Neon Shore Cover Studio — main UI wiring
import { state, addPhoto, selectPanel, setLayout, setGrade, setFontFamily, randomize, getCurrentPhoto, getSelectedPanel, initPanelsForPhoto } from './state.js';
import { layouts } from './layouts.js';
import { grades } from './grades.js';
import { renderToCanvas, exportPNG } from './render.js';

// DOM elements
const fileInput = document.getElementById('photo-input');
const sampleBtns = document.querySelectorAll('.sample-btn');
const previewCanvas = document.getElementById('preview-canvas');
const captionInput = document.getElementById('caption-input');
const subtitleInput = document.getElementById('subtitle-input');
const layoutSelect = document.getElementById('layout-select');
const gradeSelect = document.getElementById('grade-select');
const fontSelect = document.getElementById('font-select');
const zoomSlider = document.getElementById('zoom-slider');
const exportBtns = document.querySelectorAll('.export-btn');
const randomizeBtn = document.getElementById('randomize-btn');
const panelContainer = document.getElementById('panel-selector');

// State for drag/pan
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let panelStartOffset = { x: 0, y: 0 };

// Initialize UI
function initUI() {
  // Populate layout select
  layouts.forEach((layout, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = layout.name;
    layoutSelect.appendChild(opt);
  });

  // Populate grade select
  grades.forEach((grade, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = grade.name;
    gradeSelect.appendChild(opt);
  });

  // Populate font select
  const fonts = ['Archivo Black', 'Anton', 'Bebas Neue', 'Pacifico'];
  fonts.forEach((font) => {
    const opt = document.createElement('option');
    opt.value = font;
    opt.textContent = font;
    fontSelect.appendChild(opt);
  });

  // Load sample images
  loadSample('samples/boulevard.jpg', 'Boulevard');
  loadSample('samples/pier.jpg', 'Pier');

  // Keyboard shortcuts
  window.addEventListener('keydown', handleKeydown);
}

async function loadSample(path, name) {
  try {
    const res = await fetch(path);
    const blob = await res.blob();
    const file = new File([blob], name + '.jpg', { type: 'image/jpeg' });
    await addPhoto(file);
    renderPreview();
  } catch (e) {
    console.warn('Failed to load sample:', path, e);
  }
}

function handleKeydown(e) {
  // Ignore when typing in inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

  switch (e.key) {
    case 'r':
    case 'R':
      randomize();
      layoutSelect.value = state.layoutIndex;
      gradeSelect.value = state.gradeIndex;
      updatePanelSelector();
      renderPreview();
      break;
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6': {
      const idx = Number(e.key) - 1;
      if (idx < layouts.length) {
        setLayout(idx);
        layoutSelect.value = idx;
        updatePanelSelector();
        renderPreview();
      }
      break;
    }
    case 'ArrowUp':
      e.preventDefault();
      adjustZoom(0.1);
      break;
    case 'ArrowDown':
      e.preventDefault();
      adjustZoom(-0.1);
      break;
    case 's':
    case 'S':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        exportBtns[0].click(); // Quick export square
      }
      break;
  }
}

function adjustZoom(delta) {
  const panel = getSelectedPanel();
  if (panel) {
    panel.zoom = Math.max(1, Math.min(5, panel.zoom + delta));
    zoomSlider.value = panel.zoom;
    renderPreview();
  }
}

// File input handler
fileInput.addEventListener('change', async (e) => {
  if (e.target.files && e.target.files[0]) {
    await addPhoto(e.target.files[0]);
    renderPreview();
    updatePanelSelector();
  }
});

// Sample buttons
sampleBtns.forEach((btn) => {
  btn.addEventListener('click', async () => {
    const path = btn.dataset.sample;
    const name = btn.dataset.name;
    await loadSample(path, name);
    updatePanelSelector();
  });
});

// Caption/subtitle inputs
captionInput.addEventListener('input', () => {
  state.caption = captionInput.value;
  renderPreview();
});

subtitleInput.addEventListener('input', () => {
  state.subtitle = subtitleInput.value;
  renderPreview();
});

// Layout select
layoutSelect.addEventListener('change', () => {
  setLayout(Number(layoutSelect.value));
  updatePanelSelector();
  renderPreview();
});

// Grade select
gradeSelect.addEventListener('change', () => {
  setGrade(Number(gradeSelect.value));
  renderPreview();
});

// Font select
fontSelect.addEventListener('change', () => {
  setFontFamily(fontSelect.value);
  renderPreview();
});

// Zoom slider
zoomSlider.addEventListener('input', () => {
  const panel = getSelectedPanel();
  if (panel) {
    panel.zoom = Number(zoomSlider.value);
    renderPreview();
  }
});

// Export buttons
exportBtns.forEach((btn) => {
  btn.addEventListener('click', async () => {
    const width = Number(btn.dataset.width);
    const height = Number(btn.dataset.height);
    btn.disabled = true;
    btn.textContent = 'Exporting...';
    try {
      const blob = await exportPNG(width, height);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neon-shore-${width}x${height}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
      alert('Export failed: ' + e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = btn.dataset.label;
    }
  });
});

// Randomize button
randomizeBtn.addEventListener('click', () => {
  randomize();
  layoutSelect.value = state.layoutIndex;
  gradeSelect.value = state.gradeIndex;
  updatePanelSelector();
  renderPreview();
});

// Panel selector
function updatePanelSelector() {
  panelContainer.innerHTML = '';
  state.panels.forEach((panel, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'panel-btn' + (panel.selected ? ' selected' : '');
    btn.textContent = `Panel ${i + 1}`;
    btn.addEventListener('click', () => {
      selectPanel(i);
      updatePanelSelector();
      updateZoomSlider();
      renderPreview();
    });
    panelContainer.appendChild(btn);
  });
}

function updateZoomSlider() {
  const panel = getSelectedPanel();
  if (panel) {
    zoomSlider.value = panel.zoom;
  }
}

// Canvas drag/pan handling
previewCanvas.addEventListener('mousedown', (e) => {
  const panel = getSelectedPanel();
  if (!panel) return;
  isDragging = true;
  dragStart = { x: e.clientX, y: e.clientY };
  panelStartOffset = { x: panel.offsetX, y: panel.offsetY };
  previewCanvas.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const panel = getSelectedPanel();
  if (!panel) return;
  const dx = (e.clientX - dragStart.x) / previewCanvas.clientWidth;
  const dy = (e.clientY - dragStart.y) / previewCanvas.clientHeight;
  panel.offsetX = Math.max(-0.5, Math.min(0.5, panelStartOffset.x + dx));
  panel.offsetY = Math.max(-0.5, Math.min(0.5, panelStartOffset.y + dy));
  renderPreview();
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  previewCanvas.style.cursor = 'grab';
});

// Wheel zoom
previewCanvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const panel = getSelectedPanel();
  if (!panel) return;
  const delta = e.deltaY > 0 ? -0.05 : 0.05;
  panel.zoom = Math.max(1, Math.min(5, panel.zoom + delta));
  zoomSlider.value = panel.zoom;
  renderPreview();
}, { passive: false });

// Touch support for mobile
previewCanvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    const panel = getSelectedPanel();
    if (!panel) return;
    isDragging = true;
    dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    panelStartOffset = { x: panel.offsetX, y: panel.offsetY };
  }
}, { passive: true });

previewCanvas.addEventListener('touchmove', (e) => {
  if (!isDragging || e.touches.length !== 1) return;
  e.preventDefault();
  const panel = getSelectedPanel();
  if (!panel) return;
  const dx = (e.touches[0].clientX - dragStart.x) / previewCanvas.clientWidth;
  const dy = (e.touches[0].clientY - dragStart.y) / previewCanvas.clientHeight;
  panel.offsetX = Math.max(-0.5, Math.min(0.5, panelStartOffset.x + dx));
  panel.offsetY = Math.max(-0.5, Math.min(0.5, panelStartOffset.y + dy));
  renderPreview();
}, { passive: false });

previewCanvas.addEventListener('touchend', () => {
  isDragging = false;
});

// Render preview
async function renderPreview() {
  try {
    await renderToCanvas(previewCanvas, 600, 600);
  } catch (e) {
    console.error('Preview render failed:', e);
  }
}

// Initial render
initUI();
updatePanelSelector();
updateZoomSlider();
renderPreview();