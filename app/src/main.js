// Neon Shore Cover Studio - Main UI Wiring
// File input, samples, panel selection, drag/pan/zoom, caption, font/layout/grade pickers, export

import { state, addPhoto, selectPhoto, setLayout, setGrade, setFont, setCaption, setSubtitle, getCurrentPhoto, getCurrentLayout, getCurrentGrade, getCurrentFont, randomize, initPanelsForPhoto } from './state.js';
import { layouts } from './layouts.js';
import { grades } from './grades.js';
import { exportPNG, previewCover } from './render.js';

const elements = {
  fileInput: null,
  sampleButtons: null,
  layoutSelect: null,
  gradeSelect: null,
  fontSelect: null,
  captionInput: null,
  subtitleInput: null,
  canvas: null,
  previewCanvas: null,
  exportButtons: null,
  randomizeBtn: null,
  panelsContainer: null,
  zoomSlider: null,
  zoomValue: null,
};

let selectedPanelIndex = 0;
let animationFrameId = null;

export function init() {
  cacheElements();
  bindEvents();
  loadSamples();
  setupCanvas();
  renderUI();
  startRenderLoop();
}

function cacheElements() {
  elements.fileInput = document.getElementById('file-input');
  elements.sampleButtons = document.getElementById('sample-buttons');
  elements.layoutSelect = document.getElementById('layout-select');
  elements.gradeSelect = document.getElementById('grade-select');
  elements.fontSelect = document.getElementById('font-select');
  elements.captionInput = document.getElementById('caption-input');
  elements.subtitleInput = document.getElementById('subtitle-input');
  elements.canvas = document.getElementById('main-canvas');
  elements.previewCanvas = document.getElementById('preview-canvas');
  elements.exportButtons = document.getElementById('export-buttons');
  elements.randomizeBtn = document.getElementById('randomize-btn');
  elements.panelsContainer = document.getElementById('panels-list');
  elements.zoomSlider = document.getElementById('zoom-slider');
  elements.zoomValue = document.getElementById('zoom-value');
}

function bindEvents() {
  elements.fileInput.addEventListener('change', handleFileSelect);
  
  elements.layoutSelect.addEventListener('change', (e) => {
    setLayout(parseInt(e.target.value, 10));
    renderUI();
  });
  
  elements.gradeSelect.addEventListener('change', (e) => {
    setGrade(parseInt(e.target.value, 10));
  });
  
  elements.fontSelect.addEventListener('change', (e) => {
    setFont(parseInt(e.target.value, 10));
  });
  
  elements.captionInput.addEventListener('input', (e) => setCaption(e.target.value));
  elements.subtitleInput.addEventListener('input', (e) => setSubtitle(e.target.value));
  
  elements.randomizeBtn.addEventListener('click', () => {
    randomize();
    renderUI();
  });
  
  elements.zoomSlider.addEventListener('input', (e) => {
    const zoom = parseFloat(e.target.value);
    elements.zoomValue.textContent = zoom.toFixed(2) + 'x';
    if (state.panels[selectedPanelIndex]) {
      state.panels[selectedPanelIndex].zoom = zoom;
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key >= '1' && e.key <= '6') {
      const idx = parseInt(e.key, 10) - 1;
      if (idx < layouts.length) {
        setLayout(idx);
        elements.layoutSelect.value = idx;
        renderUI();
      }
    }
    if (e.key === 'ArrowRight' && state.layoutIndex < layouts.length - 1) {
      setLayout(state.layoutIndex + 1);
      elements.layoutSelect.value = state.layoutIndex;
      renderUI();
    }
    if (e.key === 'ArrowLeft' && state.layoutIndex > 0) {
      setLayout(state.layoutIndex - 1);
      elements.layoutSelect.value = state.layoutIndex;
      renderUI();
    }
    if (e.key === 'ArrowUp' && state.gradeIndex < grades.length - 1) {
      setGrade(state.gradeIndex + 1);
      elements.gradeSelect.value = state.gradeIndex;
    }
    if (e.key === 'ArrowDown' && state.gradeIndex > 0) {
      setGrade(state.gradeIndex - 1);
      elements.gradeSelect.value = state.gradeIndex;
    }
  });
  
  // Export buttons
  state.exportSizes.forEach((size, i) => {
    const btn = document.getElementById(`export-${i}`);
    if (btn) {
      btn.addEventListener('click', () => exportPNG(size.width, size.height));
    }
  });
  
  // Canvas drag/pan for selected panel
  elements.canvas.addEventListener('mousedown', handleCanvasMouseDown);
  elements.canvas.addEventListener('wheel', handleCanvasWheel, { passive: false });
  elements.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  elements.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
}

function loadSamples() {
  const samples = [
    { name: 'boulevard', label: 'Boulevard' },
    { name: 'pier', label: 'Pier' },
  ];
  
  samples.forEach((sample) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sample-btn';
    btn.textContent = sample.label;
    btn.addEventListener('click', async () => {
      const resp = await fetch(`samples/${sample.name}.jpg`);
      const blob = await resp.blob();
      const file = new File([blob], `${sample.name}.jpg`, { type: 'image/jpeg' });
      await addPhoto(file, sample.label);
      renderUI();
    });
    elements.sampleButtons.appendChild(btn);
  });
}

function setupCanvas() {
  const ctx = elements.canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  elements.canvas.width = 800 * dpr;
  elements.canvas.height = 600 * dpr;
  elements.canvas.style.width = '800px';
  elements.canvas.style.height = '600px';
  ctx.scale(dpr, dpr);
}

function startRenderLoop() {
  function render() {
    renderCanvas();
    animationFrameId = requestAnimationFrame(render);
  }
  render();
}

function renderCanvas() {
  const photo = getCurrentPhoto();
  const layout = getCurrentLayout();
  const grade = getCurrentGrade();
  const font = getCurrentFont();
  
  if (!photo || !layout) return;
  
  const ctx = elements.canvas.getContext('2d');
  const width = 800;
  const height = 600;
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  
  // Draw panels
  for (let i = 0; i < state.panels.length; i++) {
    const panel = state.panels[i];
    const panelW = panel.w * width;
    const panelH = panel.h * height;
    const panelX = panel.x * width;
    const panelY = panel.y * height;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(panelX, panelY, panelW, panelH);
    ctx.clip();
    
    const scale = Math.max(panelW / photo.width, panelH / photo.height) * panel.zoom;
    const drawW = photo.width * scale;
    const drawH = photo.height * scale;
    const drawX = panelX + (panelW - drawW) / 2 + panel.offsetX;
    const drawY = panelY + (panelH - drawH) / 2 + panel.offsetY;
    
    ctx.drawImage(photo.img, drawX, drawY, drawW, drawH);
    ctx.restore();
    
    // Highlight selected panel
    if (i === selectedPanelIndex) {
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 3;
      ctx.strokeRect(panelX + 1, panelY + 1, panelW - 2, panelH - 2);
    }
  }
  
  // Apply grade
  if (grade && grade.apply) {
    grade.apply(ctx, width, height);
  }
  
  // Draw caption
  drawCaption(ctx, width, height, font);
}

function drawCaption(ctx, width, height, font) {
  const { caption, subtitle } = state;
  if (!caption && !subtitle) return;
  
  const fontSize = Math.min(width, height) * 0.08;
  const subtitleSize = fontSize * 0.4;
  
  ctx.font = `${fontSize}px "${font.family}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const centerX = width / 2;
  const centerY = height / 2;
  
  if (caption) {
    ctx.lineWidth = fontSize * 0.15;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(caption, centerX, centerY - subtitleSize * 0.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(caption, centerX, centerY - subtitleSize * 0.5);
  }
  
  if (subtitle) {
    ctx.font = `${subtitleSize}px "${font.family}"`;
    const glowColor = '#ff00ff';
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = subtitleSize * 0.3;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(subtitle, centerX, centerY + fontSize * 0.6);
    ctx.shadowBlur = 0;
  }
}

async function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      await addPhoto(file, file.name);
    }
  }
  elements.fileInput.value = '';
  renderUI();
}

function handleCanvasMouseDown(e) {
  const rect = elements.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Check which panel was clicked
  const layout = getCurrentLayout();
  for (let i = 0; i < state.panels.length; i++) {
    const panel = state.panels[i];
    const panelW = panel.w * rect.width;
    const panelH = panel.h * rect.height;
    const panelX = panel.x * rect.width;
    const panelY = panel.y * rect.height;
    
    if (x >= panelX && x <= panelX + panelW && y >= panelY && y <= panelY + panelH) {
      selectedPanelIndex = i;
      state.panels[i].dragging = true;
      state.panels[i].dragStartX = x;
      state.panels[i].dragStartY = y;
      state.panels[i].dragStartOffsetX = state.panels[i].offsetX;
      state.panels[i].dragStartOffsetY = state.panels[i].offsetY;
      renderPanelsList();
      break;
    }
  }
  
  document.addEventListener('mousemove', handleCanvasMouseMove);
  document.addEventListener('mouseup', handleCanvasMouseUp);
}

function handleCanvasMouseMove(e) {
  const rect = elements.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const panel = state.panels[selectedPanelIndex];
  if (panel && panel.dragging) {
    const layout = getCurrentLayout();
    const panelW = panel.w * rect.width;
    const panelH = panel.h * rect.height;
    
    const dx = (x - panel.dragStartX) / panel.zoom;
    const dy = (y - panel.dragStartY) / panel.zoom;
    
    panel.offsetX = panel.dragStartOffsetX + dx;
    panel.offsetY = panel.dragStartOffsetY + dy;
  }
}

function handleCanvasMouseUp() {
  if (state.panels[selectedPanelIndex]) {
    state.panels[selectedPanelIndex].dragging = false;
  }
  document.removeEventListener('mousemove', handleCanvasMouseMove);
  document.removeEventListener('mouseup', handleCanvasMouseUp);
}

function handleCanvasWheel(e) {
  e.preventDefault();
  const panel = state.panels[selectedPanelIndex];
  if (!panel) return;
  
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  panel.zoom = Math.max(0.5, Math.min(5, panel.zoom * delta));
  elements.zoomSlider.value = panel.zoom;
  elements.zoomValue.textContent = panel.zoom.toFixed(2) + 'x';
}

function handleTouchStart(e) {
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    elements.canvas.dispatchEvent(mouseEvent);
  }
}

function handleTouchMove(e) {
  if (e.touches.length === 1) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    document.dispatchEvent(mouseEvent);
  }
}

function renderUI() {
  renderPhotoSelector();
  renderLayoutSelect();
  renderGradeSelect();
  renderFontSelect();
  renderPanelsList();
  updateZoomSlider();
}

function renderPhotoSelector() {
  // Photos are loaded via sample buttons and file input
}

function renderLayoutSelect() {
  elements.layoutSelect.innerHTML = '';
  layouts.forEach((layout, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = layout.name;
    if (i === state.layoutIndex) opt.selected = true;
    elements.layoutSelect.appendChild(opt);
  });
}

function renderGradeSelect() {
  elements.gradeSelect.innerHTML = '';
  grades.forEach((grade, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = grade.name;
    if (i === state.gradeIndex) opt.selected = true;
    elements.gradeSelect.appendChild(opt);
  });
}

function renderFontSelect() {
  elements.fontSelect.innerHTML = '';
  state.fonts.forEach((font, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = font.name;
    if (i === state.fontIndex) opt.selected = true;
    elements.fontSelect.appendChild(opt);
  });
}

function renderPanelsList() {
  elements.panelsContainer.innerHTML = '';
  state.panels.forEach((panel, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'panel-btn' + (i === selectedPanelIndex ? ' active' : '');
    btn.textContent = `Panel ${i + 1}`;
    btn.addEventListener('click', () => {
      selectedPanelIndex = i;
      updateZoomSlider();
      renderPanelsList();
    });
    elements.panelsContainer.appendChild(btn);
  });
}

function updateZoomSlider() {
  const panel = state.panels[selectedPanelIndex];
  if (panel) {
    elements.zoomSlider.value = panel.zoom;
    elements.zoomValue.textContent = panel.zoom.toFixed(2) + 'x';
  }
}

// Handle shot query params for screenshots
function applyShotParams() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot === 'cover') {
    document.body.classList.add('shot-mode');
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  applyShotParams();
  init();
});