// Neon Shore Cover Studio - Canvas Renderer
// Draws panels with per-panel crop/zoom/pan, grade, caption lettering, exports PNG

import { state, getCurrentPhoto, getCurrentLayout, getCurrentGrade, getCurrentFont } from './state.js';
import { grades } from './grades.js';

const loadedFonts = new Map();

export async function ensureFontLoaded(font) {
  if (loadedFonts.has(font.family)) return;
  const fontFace = new FontFace(font.family, `url(fonts/${font.file})`);
  await fontFace.load();
  document.fonts.add(fontFace);
  loadedFonts.set(font.family, true);
}

function drawPanel(ctx, panel, photo, canvasWidth, canvasHeight) {
  const { img, width: imgW, height: imgH } = photo;
  const panelW = panel.w * canvasWidth;
  const panelH = panel.h * canvasHeight;
  const panelX = panel.x * canvasWidth;
  const panelY = panel.y * canvasHeight;

  ctx.save();
  ctx.beginPath();
  ctx.rect(panelX, panelY, panelW, panelH);
  ctx.clip();

  const scale = Math.max(panelW / imgW, panelH / imgH) * panel.zoom;
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const drawX = panelX + (panelW - drawW) / 2 + panel.offsetX;
  const drawY = panelY + (panelH - drawH) / 2 + panel.offsetY;

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();
}

function drawVignette(ctx, width, height) {
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.3,
    width / 2, height / 2, Math.max(width, height) * 0.7
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawCaption(ctx, canvasWidth, canvasHeight, font) {
  const { caption, subtitle } = state;
  if (!caption && !subtitle) return;

  const fontSize = Math.min(canvasWidth, canvasHeight) * 0.08;
  const subtitleSize = fontSize * 0.4;

  ctx.font = `${fontSize}px "${font.family}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Draw main caption with thick black outline and white fill
  if (caption) {
    ctx.lineWidth = fontSize * 0.15;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(caption, centerX, centerY - subtitleSize * 0.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(caption, centerX, centerY - subtitleSize * 0.5);
  }

  // Draw subtitle with neon glow
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

export async function renderToCanvas(canvas, width, height) {
  const photo = getCurrentPhoto();
  const layout = getCurrentLayout();
  const grade = getCurrentGrade();
  const font = getCurrentFont();

  if (!photo || !layout) return;

  await ensureFontLoaded(font);

  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;

  // Clear canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Draw all panels
  for (const panel of state.panels) {
    drawPanel(ctx, panel, photo, width, height);
  }

  // Apply subtle vignette
  drawVignette(ctx, width, height);

  // Apply color grade
  if (grade && grade.apply) {
    grade.apply(ctx, width, height);
  }

  // Draw caption and subtitle
  drawCaption(ctx, width, height, font);
}

export async function exportPNG(width, height) {
  const canvas = document.createElement('canvas');
  await renderToCanvas(canvas, width, height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neon-shore-cover-${width}x${height}.png`;
      a.click();
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
}

export async function previewCover(width, height) {
  const canvas = document.createElement('canvas');
  await renderToCanvas(canvas, width, height);
  return canvas.toDataURL('image/png');
}