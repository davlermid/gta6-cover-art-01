// Canvas renderer for Neon Shore Cover Studio
// Handles drawing panels, color grades, text, and PNG export

import { state } from './state.js';
import { layouts } from './layouts.js';
import { grades } from './grades.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const previewCanvas = document.getElementById('preview-canvas');
const previewCtx = previewCanvas.getContext('2d');

let fontFacesLoaded = false;

export async function loadFonts() {
  if (fontFacesLoaded) return;
  
  const fonts = [
    { family: 'Archivo Black', url: 'fonts/ArchivoBlack-Regular.ttf' },
    { family: 'Anton', url: 'fonts/Anton-Regular.ttf' },
    { family: 'Bebas Neue', url: 'fonts/BebasNeue-Regular.ttf' },
    { family: 'Pacifico', url: 'fonts/Pacifico-Regular.ttf' },
  ];
  
  await Promise.all(fonts.map(f => {
    const fontFace = new FontFace(f.family, `url(${f.url})`);
    return fontFace.load().then(loaded => document.fonts.add(loaded));
  }));
  
  fontFacesLoaded = true;
}

function drawPanel(ctx, panel, panelIndex, canvasWidth, canvasHeight) {
  const photo = state.photos.get(panel.photoKey);
  if (!photo || !photo.img) return;

  const { img, width: imgW, height: imgH } = photo;
  const zoom = state.panelZooms[panelIndex] || 1;
  const crop = panel.crop || { x: 0.5, y: 0.5, scale: 1 };

  const panelW = panel.w * canvasWidth;
  const panelH = panel.h * canvasHeight;
  const panelX = panel.x * canvasWidth;
  const panelY = panel.y * canvasHeight;

  ctx.save();
  ctx.beginPath();
  ctx.rect(panelX, panelY, panelW, panelH);
  ctx.clip();

  // Handle diagonal slash layout clipping
  if (panel.clip === 'lower') {
    ctx.beginPath();
    ctx.moveTo(panelX, panelY + panelH);
    ctx.lineTo(panelX + panelW, panelY);
    ctx.lineTo(panelX + panelW, panelY + panelH);
    ctx.closePath();
    ctx.clip();
  } else if (panel.clip === 'upper') {
    ctx.beginPath();
    ctx.moveTo(panelX, panelY);
    ctx.lineTo(panelX + panelW, panelY);
    ctx.lineTo(panelX, panelY + panelH);
    ctx.closePath();
    ctx.clip();
  }

  // Calculate source rectangle from crop/zoom
  const sourceW = imgW / zoom;
  const sourceH = imgH / zoom;
  const sourceX = (crop.x - 0.5) * imgW + imgW / 2 - sourceW / 2;
  const sourceY = (crop.y - 0.5) * imgH + imgH / 2 - sourceH / 2;

  // Clamp to image bounds
  const clampedSX = Math.max(0, Math.min(imgW - sourceW, sourceX));
  const clampedSY = Math.max(0, Math.min(imgH - sourceH, sourceY));

  ctx.drawImage(
    img,
    clampedSX, clampedSY, sourceW, sourceH,
    panelX, panelY, panelW, panelH
  );

  // Highlight active panel in multi-panel layouts (editor only - not in export)
  if (state.panels.length > 1 && panelIndex === state.activePanelIndex && canvasWidth <= 1280) {
    ctx.strokeStyle = 'rgba(255, 42, 109, 0.8)';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(panelX + 2, panelY + 2, panelW - 4, panelH - 4);
    ctx.setLineDash([]);
  }

  ctx.restore();
}

function drawCaption(ctx, canvasWidth, canvasHeight) {
  const caption = state.caption.toUpperCase();
  const subtitle = state.subtitle;
  const fontFamily = state.fontFamily;
  
  // Main caption - Archivo Black style: white fill, thick black outline
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Font size scales with canvas
  const baseSize = Math.min(canvasWidth, canvasHeight) * 0.085;
  ctx.font = `800 ${baseSize}px "${fontFamily}"`;
  
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight * 0.82;
  
  // Thick black outline (stroke)
  ctx.lineWidth = baseSize * 0.12;
  ctx.strokeStyle = '#000';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeText(caption, centerX, centerY);
  
  // White fill
  ctx.fillStyle = '#fff';
  ctx.fillText(caption, centerX, centerY);
  
  // Subtitle with neon glow
  if (subtitle) {
    const subSize = baseSize * 0.35;
    ctx.font = `400 ${subSize}px "${fontFamily}"`;
    const subY = centerY + baseSize * 0.7;
    
    // Neon glow effect - multiple shadow layers
    ctx.shadowColor = '#ff2a6d';
    ctx.shadowBlur = subSize * 0.8;
    ctx.fillStyle = '#ff2a6d';
    ctx.fillText(subtitle, centerX, subY);
    
    // Brighter core
    ctx.shadowBlur = subSize * 0.3;
    ctx.fillStyle = '#fff';
    ctx.fillText(subtitle, centerX, subY);
  }
  
  ctx.restore();
}

function applyGrade(ctx, canvasWidth, canvasHeight) {
  const grade = grades[state.gradeIndex];
  if (grade && grade.apply) {
    grade.apply(ctx, canvasWidth, canvasHeight);
  }
}

export function render() {
  const cw = state.canvasWidth;
  const ch = state.canvasHeight;
  
  canvas.width = cw;
  canvas.height = ch;
  
  // Clear
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, cw, ch);
  
  // Draw all panels
  state.panels.forEach((panel, i) => {
    drawPanel(ctx, panel, i, cw, ch);
  });
  
  // Apply color grade
  applyGrade(ctx, cw, ch);
  
  // Draw caption on top
  drawCaption(ctx, cw, ch);
  
  // Update preview (smaller)
  renderPreview();
}

function renderPreview() {
  const pw = previewCanvas.width;
  const ph = previewCanvas.height;
  const scale = Math.min(pw / state.canvasWidth, ph / state.canvasHeight);
  const dw = state.canvasWidth * scale;
  const dh = state.canvasHeight * scale;
  const dx = (pw - dw) / 2;
  const dy = (ph - dh) / 2;
  
  previewCtx.fillStyle = '#000';
  previewCtx.fillRect(0, 0, pw, ph);
  previewCtx.drawImage(canvas, dx, dy, dw, dh);
}

export async function exportPNG(width, height) {
  await loadFonts();
  
  const oldW = state.canvasWidth;
  const oldH = state.canvasHeight;
  
  state.canvasWidth = width;
  state.canvasHeight = height;
  
  // Rebuild panels for new aspect ratio
  const layout = layouts[state.layoutIndex];
  if (layout) {
    state.panels = layout.panels.map((panelRect, i) => ({
      ...panelRect,
      photoKey: state.currentPhotoKey,
      crop: state.panels[i]?.crop || { x: 0.5, y: 0.5, scale: 1 },
    }));
  }
  
  // Render to offscreen canvas for export
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = width;
  exportCanvas.height = height;
  const exportCtx = exportCanvas.getContext('2d', { willReadFrequently: true });
  
  // Draw panels
  state.panels.forEach((panel, i) => {
    drawPanel(exportCtx, panel, i, width, height);
  });
  
  // Apply grade
  applyGrade(exportCtx, width, height);
  
  // Draw caption
  drawCaption(exportCtx, width, height);
  
  // Restore original size
  state.canvasWidth = oldW;
  state.canvasHeight = oldH;
  if (layout) {
    state.panels = layout.panels.map((panelRect, i) => ({
      ...panelRect,
      photoKey: state.currentPhotoKey,
      crop: state.panels[i]?.crop || { x: 0.5, y: 0.5, scale: 1 },
    }));
  }
  
  // Render preview at original size
  render();
  
  return exportCanvas.toDataURL('image/png');
}

export function getCanvas() {
  return canvas;
}

export function getContext() {
  return ctx;
}