// Main UI wiring for Neon Shore Cover Studio

import { state, resetState, addPhoto, getCurrentPhoto, setLayout, setGrade, setFont, setCaption, setSubtitle, setCanvasSize, rebuildPanels, updatePanelCrop, updatePanelZoom, setActivePanel, getCurrentPhotoKey } from './state.js';
import { layouts, getLayoutIndexByName } from './layouts.js';
import { grades, getGradeIndexByName } from './grades.js';
import { render, exportPNG, loadFonts, getCanvas } from './render.js';
import { parseShotQuery, buildShotURL } from './shots.js';

const canvas = getCanvas();
const statusText = document.getElementById('status-text');

// DOM elements
const photoInput = document.getElementById('photo-input');
const samplePicker = document.getElementById('sample-picker');
const layoutPicker = document.getElementById('layout-picker');
const gradePicker = document.getElementById('grade-picker');
const captionInput = document.getElementById('caption-input');
const subtitleInput = document.getElementById('subtitle-input');
const fontPicker = document.getElementById('font-picker');
const zoomSlider = document.getElementById('zoom-slider');
const zoomValue = document.getElementById('zoom-value');
const btnRandom = document.getElementById('btn-random');
const exportButtons = document.querySelectorAll('.export-group button');

// Initialize UI
function initUI() {
  // Populate layout picker
  layouts.forEach((layout, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = layout.name;
    layoutPicker.appendChild(opt);
  });
  
  // Populate grade picker
  grades.forEach((grade, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = grade.name;
    gradePicker.appendChild(opt);
  });
  
  // Populate font picker
  state.fonts.forEach(font => {
    const opt = document.createElement('option');
    opt.value = font.family;
    opt.textContent = font.name;
    fontPicker.appendChild(opt);
  });
  
  // Load built-in samples
  loadSample('samples/boulevard.jpg', 'boulevard');
  loadSample('samples/pier.jpg', 'pier');
  
  // Apply URL params if present (for screenshots)
  applyURLParams();
  
  // Initial rebuild
  rebuildPanels();
  render();
  updateStatus('Ready — drag on canvas to pan, scroll to zoom');
}

async function loadSample(path, key) {
  try {
    const img = new Image();
    img.src = path;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    addPhoto(key, img, key);
    console.log(`Loaded sample: ${key}`);
  } catch (e) {
    console.warn(`Failed to load sample ${key}:`, e);
  }
}

function applyURLParams() {
  const params = parseShotQuery(window.location.search);
  
  if (params.photo && state.photos.has(params.photo)) {
    state.currentPhotoKey = params.photo;
  }
  
  if (params.layout !== undefined) setLayout(params.layout);
  if (params.grade !== undefined) setGrade(params.grade);
  if (params.font) setFont(params.font);
  if (params.caption) setCaption(params.caption);
  if (params.subtitle) setSubtitle(params.subtitle);
  
  // Update UI controls
  layoutPicker.value = state.layoutIndex;
  gradePicker.value = state.gradeIndex;
  fontPicker.value = state.fontFamily;
  captionInput.value = state.caption;
  subtitleInput.value = state.subtitle;
  
  if (params.width && params.height) {
    setCanvasSize(params.width, params.height);
  }
  
  rebuildPanels();
}

// Event handlers
photoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.src = url;
  
  try {
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    const key = `user-${Date.now()}`;
    addPhoto(key, img, file.name);
    state.currentPhotoKey = key;
    rebuildPanels();
    render();
    updateStatus(`Loaded: ${file.name}`);
  } catch (err) {
    updateStatus('Failed to load image');
    console.error(err);
  } finally {
    URL.revokeObjectURL(url);
  }
});

samplePicker.addEventListener('change', (e) => {
  const key = e.target.value;
  if (key && state.photos.has(key)) {
    state.currentPhotoKey = key;
    rebuildPanels();
    render();
    updateStatus(`Loaded sample: ${key.replace('samples/', '').replace('.jpg', '')}`);
  }
});

layoutPicker.addEventListener('change', (e) => {
  setLayout(parseInt(e.target.value, 10));
  render();
  updateStatus(`Layout: ${layouts[state.layoutIndex].name}`);
});

gradePicker.addEventListener('change', (e) => {
  setGrade(parseInt(e.target.value, 10));
  render();
  updateStatus(`Grade: ${grades[state.gradeIndex].name}`);
});

captionInput.addEventListener('input', (e) => {
  setCaption(e.target.value);
  render();
});

subtitleInput.addEventListener('input', (e) => {
  setSubtitle(e.target.value);
  render();
});

fontPicker.addEventListener('change', (e) => {
  setFont(e.target.value);
  render();
  updateStatus(`Font: ${e.target.value}`);
});

zoomSlider.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  zoomValue.textContent = val.toFixed(2) + '×';
  updatePanelZoom(state.activePanelIndex, val - (state.panelZooms[state.activePanelIndex] || 1));
  render();
});

btnRandom.addEventListener('click', () => {
  randomizeAll();
});

exportButtons.forEach(btn => {
  btn.addEventListener('click', async () => {
    const w = parseInt(btn.dataset.w, 10);
    const h = parseInt(btn.dataset.h, 10);
    await exportAndDownload(w, h);
  });
});

// Canvas interaction: drag to pan, wheel to zoom
let isDragging = false;
let dragStart = { x: 0, y: 0 };

canvas.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  isDragging = true;
  dragStart = { x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
  updateStatus('Dragging to pan...');
});

canvas.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  updatePanelCrop(state.activePanelIndex, dx, dy);
  dragStart = { x: e.clientX, y: e.clientY };
  render();
});

canvas.addEventListener('pointerup', (e) => {
  if (!isDragging) return;
  isDragging = false;
  canvas.releasePointerCapture(e.pointerId);
  updateStatus('Pan complete');
});

canvas.addEventListener('pointerleave', () => {
  isDragging = false;
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.05 : 0.05;
  const currentZoom = state.panelZooms[state.activePanelIndex] || 1;
  const newZoom = Math.max(1, Math.min(3, currentZoom + delta));
  updatePanelZoom(state.activePanelIndex, newZoom - currentZoom);
  zoomSlider.value = newZoom;
  zoomValue.textContent = newZoom.toFixed(2) + '×';
  render();
}, { passive: false });

// Click on panel to select it (for multi-panel layouts)
canvas.addEventListener('click', (e) => {
  if (state.panels.length <= 1) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width * state.canvasWidth;
  const y = (e.clientY - rect.top) / rect.height * state.canvasHeight;
  
  for (let i = 0; i < state.panels.length; i++) {
    const panel = state.panels[i];
    const px = panel.x * state.canvasWidth;
    const py = panel.y * state.canvasHeight;
    const pw = panel.w * state.canvasWidth;
    const ph = panel.h * state.canvasHeight;
    
    if (x >= px && x <= px + pw && y >= py && y <= py + ph) {
      setActivePanel(i);
      updateStatus(`Panel ${i + 1} selected`);
      // Visual feedback
      render();
      break;
    }
  }
});

function randomizeAll() {
  // Random layout
  const layoutIdx = Math.floor(Math.random() * layouts.length);
  setLayout(layoutIdx);
  layoutPicker.value = layoutIdx;
  
  // Random grade
  const gradeIdx = Math.floor(Math.random() * grades.length);
  setGrade(gradeIdx);
  gradePicker.value = gradeIdx;
  
  // Random font
  const fontIdx = Math.floor(Math.random() * state.fonts.length);
  const font = state.fonts[fontIdx].family;
  setFont(font);
  fontPicker.value = font;
  
  // Random sample photo
  const sampleKeys = ['boulevard', 'pier'];
  const photoKey = sampleKeys[Math.floor(Math.random() * sampleKeys.length)];
  if (state.photos.has(photoKey)) {
    state.currentPhotoKey = photoKey;
    samplePicker.value = `samples/${photoKey}.jpg`;
  }
  
  // Random caption
  const captions = [
    'VICE CITY NIGHTS',
    'NEON SHORE',
    'SUNSET HEIST',
    'MIDNIGHT RUN',
    'PALM CITY DREAMS',
    'OCEAN DRIVE',
    'NEON DISTRICT',
    'HEAT WAVE',
    'RADIO TOWER',
    'PINK SKYLINE',
  ];
  const caption = captions[Math.floor(Math.random() * captions.length)];
  setCaption(caption);
  captionInput.value = caption;
  
  // Random subtitle
  const subtitles = [
    'Neon Shore',
    'Vice City',
    'Midnight Run',
    'Sunset Heist',
    'Ocean Drive',
    'Palm Trees',
    'Radio Tower',
    'Heat Wave',
  ];
  const subtitle = subtitles[Math.floor(Math.random() * subtitles.length)];
  setSubtitle(subtitle);
  subtitleInput.value = subtitle;
  
  // Random zoom per panel
  state.panelZooms = state.panels.map(() => 1 + Math.random() * 1.5);
  zoomSlider.value = state.panelZooms[0];
  zoomValue.textContent = state.panelZooms[0].toFixed(2) + '×';
  
  // Random pan per panel
  state.panels.forEach(panel => {
    panel.crop = {
      x: 0.3 + Math.random() * 0.4,
      y: 0.3 + Math.random() * 0.4,
      scale: 1,
    };
  });
  
  rebuildPanels();
  render();
  updateStatus('Randomized!');
}

async function exportAndDownload(width, height) {
  updateStatus(`Exporting ${width}×${height}...`);
  try {
    const dataUrl = await exportPNG(width, height);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `neon-shore-cover-${width}x${height}.png`;
    link.click();
    updateStatus(`Exported ${width}×${height} PNG`);
  } catch (err) {
    updateStatus('Export failed');
    console.error(err);
  }
}

function updateStatus(msg) {
  statusText.textContent = msg;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
  await loadFonts();
  initUI();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', async (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  
  switch (e.key) {
    case 'r':
    case 'R':
      randomizeAll();
      break;
    case '1':
      exportAndDownload(1080, 1080);
      break;
    case '2':
      exportAndDownload(1080, 1350);
      break;
    case '3':
      exportAndDownload(1920, 1080);
      break;
    case 'ArrowLeft':
      if (state.panels.length > 1) {
        setActivePanel(state.activePanelIndex - 1);
        render();
      }
      break;
    case 'ArrowRight':
      if (state.panels.length > 1) {
        setActivePanel(state.activePanelIndex + 1);
        render();
      }
      break;
    case 's':
    case 'S':
      // Share current shot as URL
      if (navigator.clipboard) {
        const url = buildShotURL({
          photo: getCurrentPhotoKey(),
          layout: state.layoutIndex,
          grade: state.gradeIndex,
          font: state.fontFamily,
          caption: state.caption,
          subtitle: state.subtitle,
        });
        await navigator.clipboard.writeText(url);
        updateStatus('Shot URL copied to clipboard');
      } else {
        updateStatus('Clipboard API not available');
      }
      break;
  }
});