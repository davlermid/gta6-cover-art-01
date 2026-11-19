// Neon Shore Cover Studio - Canvas Renderer
// Draws panels with crop/zoom/pan, applies grade, renders caption lettering, exports PNG

import { state, getCurrentPhoto, getPanelTransform, getPanelTransform as getTransform } from './state.js';
import { getLayout } from './layouts.js';
import { getGrade } from './grades.js';

const fontCache = new Map();

export async function loadFont(fontFamily) {
  if (fontCache.has(fontFamily)) {
    return fontCache.get(fontFamily);
  }

  const fontFace = new FontFace(fontFamily, `url(../fonts/${fontFamily}-Regular.ttf)`);
  await fontFace.load();
  document.fonts.add(fontFace);
  fontCache.set(fontFamily, fontFace);
  return fontFace;
}

export function drawPanel(ctx, panel, canvasWidth, canvasHeight, photo, transform) {
  const panelW = panel.w * canvasWidth;
  const panelH = panel.h * canvasHeight;
  const panelX = panel.x * canvasWidth;
  const panelY = panel.y * canvasHeight;

  ctx.save();
  ctx.beginPath();
  ctx.rect(panelX, panelY, panelW, panelH);
  ctx.clip();

  // Calculate source rectangle from photo with transform
  const photoAspect = photo.width / photo.height;
  const panelAspect = panelW / panelH;

  let srcW, srcH, srcX, srcY;

  if (photoAspect > panelAspect) {
    // Photo is wider - fit height
    srcH = photo.height / transform.scale;
    srcW = srcH * panelAspect;
    srcX = (photo.width - srcW) / 2 + transform.offsetX * photo.width;
    srcY = (photo.height - srcH) / 2 + transform.offsetY * photo.height;
  } else {
    // Photo is taller - fit width
    srcW = photo.width / transform.scale;
    srcH = srcW / panelAspect;
    srcX = (photo.width - srcW) / 2 + transform.offsetX * photo.width;
    srcY = (photo.height - srcH) / 2 + transform.offsetY * photo.height;
  }

  // Clamp to photo bounds
  srcX = Math.max(0, Math.min(photo.width - srcW, srcX));
  srcY = Math.max(0, Math.min(photo.height - srcH, srcY));
  srcW = Math.min(srcW, photo.width - srcX);
  srcH = Math.min(srcH, photo.height - srcY);

  ctx.drawImage(photo.image, srcX, srcY, srcW, srcH, panelX, panelY, panelW, panelH);
  ctx.restore();
}

export function applyGrade(ctx, canvasWidth, canvasHeight, gradeId) {
  const grade = getGrade(gradeId);
  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  grade.apply(imageData.data, canvasWidth, canvasHeight);
  ctx.putImageData(imageData, 0, 0);
}

export function drawCaption(ctx, canvasWidth, canvasHeight, caption, subtitle, fontFamily) {
  if (!caption && !subtitle) return;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Main caption
  if (caption) {
    const fontSize = Math.min(canvasWidth, canvasHeight) * 0.08;
    ctx.font = `bold ${fontSize}px "${fontFamily}"`;

    // Thick black outline
    ctx.lineWidth = fontSize * 0.12;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(caption, centerX, centerY - fontSize * 0.15);

    // White fill
    ctx.fillStyle = '#ffffff';
    ctx.fillText(caption, centerX, centerY - fontSize * 0.15);

    // Neon glow effect - draw glow first, then text on top for cleaner look
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = fontSize * 0.15;
    ctx.fillText(caption, centerX, centerY - fontSize * 0.15);
  }

  // Subtitle
  if (subtitle) {
    const subFontSize = Math.min(canvasWidth, canvasHeight) * 0.035;
    const subY = centerY + (caption ? fontSize * 0.5 : 0);

    ctx.font = `${subFontSize}px "${fontFamily}"`;
    ctx.lineWidth = subFontSize * 0.08;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(subtitle, centerX, subY);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(subtitle, centerX, subY);

    // Neon pink glow for subtitle
    ctx.shadowColor = '#ff2a6d';
    ctx.shadowBlur = subFontSize * 0.2;
    ctx.fillText(subtitle, centerX, subY);
  }

  ctx.restore();
}

export async function renderPreview(canvas, width, height) {
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;

  const photo = getCurrentPhoto();
  if (!photo) {
    // Draw placeholder
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#444';
    ctx.font = '24px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Add a photo to begin', width / 2, height / 2);
    return;
  }

  const layout = getLayout(state.layoutId);
  const panels = layout.panels;

  // Draw each panel
  panels.forEach((panel, i) => {
    const transform = getPanelTransform(i);
    drawPanel(ctx, panel, width, height, photo, transform);
  });

  // Apply color grade
  applyGrade(ctx, width, height, state.gradeId);

  // Draw caption
  await loadFont(state.fontFamily);
  drawCaption(ctx, width, height, state.caption, state.subtitle, state.fontFamily);
}

export async function exportPNG(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const photo = getCurrentPhoto();
  if (!photo) return null;

  const layout = getLayout(state.layoutId);
  const panels = layout.panels;

  panels.forEach((panel, i) => {
    const transform = getPanelTransform(i);
    drawPanel(ctx, panel, width, height, photo, transform);
  });

  applyGrade(ctx, width, height, state.gradeId);
  await loadFont(state.fontFamily);
  drawCaption(ctx, width, height, state.caption, state.subtitle, state.fontFamily);

  return canvas.toDataURL('image/png');
}

export async function downloadPNG(width, height, filename) {
  const dataUrl = await exportPNG(width, height);
  if (!dataUrl) return;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}