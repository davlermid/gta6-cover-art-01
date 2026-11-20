// Neon Shore Cover Studio — canvas renderer
import { state } from './state.js';
import { layouts } from './layouts.js';
import { grades } from './grades.js';

const fontFamilies = {
  'Archivo Black': 'ArchivoBlack-Regular.ttf',
  Anton: 'Anton-Regular.ttf',
  'Bebas Neue': 'BebasNeue-Regular.ttf',
  Pacifico: 'Pacifico-Regular.ttf',
};

let fontLoaded = false;
const fontPromises = {};

function loadFont(name) {
  if (fontPromises[name]) return fontPromises[name];
  const url = `../fonts/${fontFamilies[name]}`;
  fontPromises[name] = new Promise((resolve, reject) => {
    const f = new FontFace(name, `url(${url})`);
    f.load().then((loaded) => {
      document.fonts.add(loaded);
      resolve(loaded);
    }).catch(reject);
  });
  return fontPromises[name];
}

async function ensureFontLoaded(name) {
  if (!fontLoaded) {
    await Promise.all(Object.keys(fontFamilies).map(loadFont));
    fontLoaded = true;
  }
  return loadFont(name);
}

function drawPanel(ctx, panel, canvasWidth, canvasHeight) {
  const photo = state.photos[panel.photoIndex];
  if (!photo || !photo.img) return;

  const img = photo.img;
  const panelW = panel.w * canvasWidth;
  const panelH = panel.h * canvasHeight;
  const panelX = panel.x * canvasWidth;
  const panelY = panel.y * canvasHeight;

  // Calculate source rect with zoom and pan
  const imgAspect = img.width / img.height;
  const panelAspect = panelW / panelH;

  let srcW, srcH, srcX, srcY;
  if (imgAspect > panelAspect) {
    srcH = img.height / panel.zoom;
    srcW = srcH * panelAspect;
  } else {
    srcW = img.width / panel.zoom;
    srcH = srcW / panelAspect;
  }

  srcX = (img.width - srcW) / 2 + panel.offsetX * (img.width - srcW);
  srcY = (img.height - srcH) / 2 + panel.offsetY * (img.height - srcH);

  // Clamp
  srcX = Math.max(0, Math.min(srcX, img.width - srcW));
  srcY = Math.max(0, Math.min(srcY, img.height - srcH));

  ctx.save();
  ctx.beginPath();
  ctx.rect(panelX, panelY, panelW, panelH);
  ctx.clip();
  ctx.drawImage(img, srcX, srcY, srcW, srcH, panelX, panelY, panelW, panelH);
  ctx.restore();
}

function drawPanelBorders(ctx, canvasWidth, canvasHeight) {
  const layout = layouts[state.layoutIndex];
  if (layout.panels.length <= 1) return;

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);

  for (const panel of layout.panels) {
    const panelW = panel.w * canvasWidth;
    const panelH = panel.h * canvasHeight;
    const panelX = panel.x * canvasWidth;
    const panelY = panel.y * canvasHeight;

    ctx.strokeRect(panelX + 1, panelY + 1, panelW - 2, panelH - 2);
  }

  ctx.setLineDash([]);
  ctx.restore();
}

async function drawCaption(ctx, canvasWidth, canvasHeight) {
  const { caption, subtitle, fontFamily } = state;
  if (!caption && !subtitle) return;

  await ensureFontLoaded(fontFamily);

  const grade = grades[state.gradeIndex];
  const isDark = grade.name === 'Neon Night' || grade.name === 'Mono Noir';

  // Main caption
  if (caption) {
    const fontSize = Math.min(canvasWidth, canvasHeight) * 0.1;
    ctx.font = `${fontSize}px "${fontFamily}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const x = canvasWidth / 2;
    const y = canvasHeight * 0.88;

    // Thick black outline
    ctx.lineWidth = fontSize * 0.12;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.lineJoin = 'round';
    ctx.strokeText(caption.toUpperCase(), x, y);

    // White fill
    ctx.fillStyle = '#ffffff';
    ctx.fillText(caption.toUpperCase(), x, y);

    // Neon glow for subtitle area
    if (subtitle) {
      ctx.shadowColor = isDark ? '#00ffff' : '#ff33aa';
      ctx.shadowBlur = fontSize * 0.3;
    }
  }

  // Subtitle
  if (subtitle) {
    const fontSize = Math.min(canvasWidth, canvasHeight) * 0.035;
    ctx.font = `${fontSize}px "${fontFamily}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const x = canvasWidth / 2;
    const y = canvasHeight * 0.95;

    ctx.lineWidth = fontSize * 0.08;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.strokeText(subtitle, x, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(subtitle, x, y);

    ctx.shadowBlur = 0;
  }
}

export async function renderToCanvas(canvas, width, height) {
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;

  const layout = layouts[state.layoutIndex];

  // Draw panels
  for (const panel of state.panels) {
    drawPanel(ctx, panel, width, height);
  }

  // Draw subtle panel borders for multi-panel layouts
  drawPanelBorders(ctx, width, height);

  // Apply color grade
  grades[state.gradeIndex].apply(ctx, width, height);

  // Draw caption
  await drawCaption(ctx, width, height);

  return canvas;
}

export async function exportPNG(width, height) {
  const canvas = document.createElement('canvas');
  await renderToCanvas(canvas, width, height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

export async function previewCanvas(canvas) {
  return renderToCanvas(canvas, 600, 600);
}