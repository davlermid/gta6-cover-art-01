// Renderer: draws the whole cover onto any canvas at any size, from the shared state. The preview canvas and the
// export canvas both call renderCover, so the exported PNG matches the preview exactly.

import { GRADES, applyGradeLayers } from './grades.js';
import { LAYOUTS } from './layouts.js';

let fontsReady = document.fonts ? document.fonts.ready.then(() => true).catch(() => true) : Promise.resolve(true);
export function whenFontsReady() { return fontsReady; }

/** Kicks font loading (some browsers only fetch @font-face fonts once used). */
export function primeFonts(ctx) {
  ctx.font = '10px Anton';
  ctx.font = '10px Pacifico';
  ctx.font = '10px "Bebas Neue"';
}

const STAR = (cx, cy, r, ctx) => {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const b = a + Math.PI / 5;
    ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    ctx.lineTo(cx + (r * 0.45) * Math.cos(b), cy + (r * 0.45) * Math.sin(b));
  }
  ctx.closePath();
  ctx.fill();
};

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPhotoInRect(ctx, img, rect, pan, zoom, grade, coverStyle) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = '#120a1e';
  ctx.fillRect(x, y, w, h);
  if (img) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const coverScale = Math.max(w / iw, h / ih) * zoom;
    const dw = iw * coverScale;
    const dh = ih * coverScale;
    const dx = x + (w - dw) / 2 + (pan?.x || 0) * w;
    const dy = y + (h - dh) / 2 + (pan?.y || 0) * h;
    ctx.filter = grade?.filter || 'none';
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.filter = 'none';
    applyGradeLayers(ctx, x, y, w, h, grade);
  }
  ctx.restore();
  if (coverStyle === 'white') {
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = Math.max(2, w * 0.012);
    ctx.strokeRect(x, y, w, h);
  } else if (coverStyle === 'ink') {
    ctx.strokeStyle = 'rgba(10,8,18,0.9)';
    ctx.lineWidth = Math.max(2, w * 0.008);
    ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = Math.max(1, w * 0.003);
    ctx.strokeRect(x + w * 0.012, y + h * 0.012, w * 0.976, h * 0.976);
  }
}

function drawGrain(ctx, x, y, w, h, amount = 18) {
  const gw = Math.max(1, Math.round(w / 3));
  const gh = Math.max(1, Math.round(h / 3));
  const data = ctx.createImageData(gw, gh);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const v = 128 + (Math.random() * 2 - 1) * 255 * (amount / 255);
    px[i] = px[i + 1] = px[i + 2] = v;
    px[i + 3] = amount * 5;
  }
  const off = document.createElement('canvas');
  off.width = gw;
  off.height = gh;
  off.getContext('2d').putImageData(data, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  const pattern = ctx.createPattern(off, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function drawVignette(ctx, x, y, w, h) {
  const g = ctx.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.35, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(5,0,15,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function drawHalftone(ctx, x, y, w, h) {
  const step = Math.max(4, Math.min(w, h) / 60);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  for (let yy = y + step / 2, row = 0; yy < y + h; yy += step, row++) {
    for (let xx = x + step / 2; xx < x + w; xx += step) {
      const t = (yy - y) / h;
      const r = (step / 2) * (1.15 - t) * (0.4 + 0.6 * Math.abs(Math.sin((xx + row * 7) / (step * 3))));
      if (r > 0.4) {
        ctx.beginPath();
        ctx.arc(xx, yy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(10,6,24,${0.5 - 0.35 * t})`;
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function fitText(ctx, text, maxW, size, family, weight = '') {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`.trim();
  while (ctx.measureText(text).width > maxW && s > size * 0.3) {
    s *= 0.94;
    ctx.font = `${weight} ${s}px ${family}`.trim();
  }
  return s;
}

function drawTitleBlock(ctx, W, H, state) {
  const t = state;
  const box = t.titleBox || { x: 0.05, y: (t.titleY ?? 66) / 100, w: 0.9, h: Math.max(0.1, 0.98 - (t.titleY ?? 66) / 100) };
  const bx = box.x * W;
  const by = box.y * H;
  const bw = box.w * W;
  const bh = Math.max(box.h * H, H - by - H * 0.02);
  const pad = W * 0.015;
  const band = box.band;

  if (t.halftone) drawHalftone(ctx, bx, by, bw, bh);
  // Legibility scrim behind the lettering
  const scrim = ctx.createLinearGradient(0, by - bh * 0.25, 0, by + bh);
  scrim.addColorStop(0, 'rgba(10,4,22,0)');
  scrim.addColorStop(0.4, 'rgba(10,4,22,0.55)');
  scrim.addColorStop(1, 'rgba(10,4,22,0.75)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, by - bh * 0.2, W, H - (by - bh * 0.2));

  const blockTop = by;
  // Heat stars
  const starR = H * 0.016;
  for (let i = 0; i < 5; i++) {
    const cx = bx + pad + starR + i * (starR * 2.35);
    const cy = blockTop + starR * 1.6;
    ctx.beginPath();
    ctx.fillStyle = i < t.stars ? 'rgba(255,214,64,0.95)' : 'rgba(255,255,255,0.28)';
    STAR(cx, cy, starR, ctx);
  }
  // Badge ribbon
  if (t.badge) {
    const label = (t.badgeText || 'WANTED').toUpperCase();
    ctx.font = `${H * 0.018}px "Bebas Neue"`;
    const tw = ctx.measureText(label).width;
    const bpad = H * 0.014;
    const rw = tw + bpad * 2;
    const rh = H * 0.036;
    const rx = bx + bw - rw - pad;
    const ry = blockTop + H * 0.004;
    ctx.save();
    ctx.translate(rx + rw / 2, ry + rh / 2);
    ctx.rotate(-0.04);
    ctx.fillStyle = 'rgba(255,60,110,0.95)';
    roundRect(ctx, -rw / 2, -rh / 2, rw, rh, rh * 0.18);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, rh * 0.04);
    ctx.restore();
  }

  // Main title, centered in the block, with shadow or sunset fill
  const titleText = (t.title || '').trim();
  if (titleText) {
    const maxW = bw - pad * 2;
    const size = fitText(ctx, titleText, maxW, (t.titleSize / 100) * H * 0.6, 'Anton', '');
    const cx = bx + bw / 2;
    const cy = blockTop + bh * 0.56;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    if (t.titleStyle === 'sunset') {
      const g = ctx.createLinearGradient(0, cy - size, 0, cy + size * 0.25);
      g.addColorStop(0, '#fff8e6');
      g.addColorStop(0.32, '#ffd34d');
      g.addColorStop(0.62, '#ff7a3c');
      g.addColorStop(1, '#ff2e88');
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = '#ffffff';
    }
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = size * 0.12;
    ctx.shadowOffsetY = size * 0.04;
    ctx.fillText(titleText, cx, cy);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    // Subtitle under the title
    const sub = (t.subtitle || '').trim();
    if (sub) {
      const ssize = size * 0.26;
      ctx.font = `${ssize}px Pacifico`;
      const sy = Math.min(cy + ssize * 0.95, blockTop + bh - H * 0.012);
      if (t.neonGlow) {
        ctx.shadowColor = 'rgba(64,230,255,0.9)';
        ctx.shadowBlur = ssize * 0.55;
      } else {
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = ssize * 0.3;
      }
      ctx.fillStyle = t.neonGlow ? '#eafcff' : '#ffd9ec';
      ctx.fillText(sub, cx, sy);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
  }
}

/** Renders the full cover from `state` at the canvas's pixel size. */
export function renderCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const grade = GRADES[state.grade] || GRADES['vice-sunset'];
  const layout = LAYOUTS[state.layout] || LAYOUTS.grid9;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none';
  ctx.fillStyle = '#160b26';
  ctx.fillRect(0, 0, W, H);

  const n = layout.panels;
  const gap = state.gap / 100;
  const rects = [];
  for (let i = 0; i < n; i++) {
    const r = layout.rects(i);
    rects.push(shrink(r, gap, state.border === 'none' ? 0 : 0));
  }
  rects.forEach((rect, i) => {
    const panel = state.panels[i] || {};
    const img = panel.img || null;
    const gradeOverride = panel.grade ? GRADES[panel.grade] : null;
    const g = gradeOverride || grade;
    if (rect.tilt) {
      ctx.save();
      const cx = (rect.x + rect.w / 2) * W;
      const cy = (rect.y + rect.h / 2) * H;
      ctx.translate(cx, cy);
      ctx.rotate((rect.tilt * Math.PI) / 180);
      ctx.translate(-cx, -cy);
      const pr = { x: rect.x * W, y: rect.y * H, w: rect.w * W, h: rect.h * H };
      // White polaroid frame for tilted snapshots
      if (state.border === 'white') {
        ctx.shadowColor = 'rgba(0,0,0,0.45)';
        ctx.shadowBlur = W * 0.02;
        ctx.fillStyle = '#f5f1e6';
        ctx.fillRect(pr.x - pr.w * 0.03, pr.y - pr.h * 0.05, pr.w + pr.w * 0.06, pr.h + pr.h * 0.1);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        const inner = { x: pr.x, y: pr.y, w: pr.w, h: pr.h };
        drawPhotoInRect(ctx, img, inner, panel.pan, panel.zoom, g, 'none');
      } else {
        drawPhotoInRect(ctx, img, pr, panel.pan, panel.zoom, g, state.border);
      }
      ctx.restore();
      // Selected-panel marker is UI-only; skip during export
      ctx.save();
      ctx.restore();
    } else {
      const pr = { x: rect.x * W, y: rect.y * H, w: rect.w * W, h: rect.h * H };
      drawPhotoInRect(ctx, img, pr, panel.pan, panel.zoom, g, state.border);
    }
  });

  drawTitleBlock(ctx, W, H, state);

  if (state.vignette) drawVignette(ctx, 0, 0, W, H);
  if (state.grain) drawGrain(ctx, 0, 0, W, H);
}

/** Shrinks a rect by `gap` on each side toward its center (keeps tilt). */
function shrink(r, gap, _) {
  const gx = gap / 2;
  const gy = gap / 2;
  return { ...r, x: r.x + gx * (r.w > 0.9 ? 0 : 1), y: r.y + gy, w: r.w - gx * (r.w > 0.9 ? 0 : 2), h: r.h - gy * 2 };
}

/** Renders at an arbitrary export size on an offscreen canvas and returns the canvas. */
export function renderExport(state, w, h) {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  renderCover(off, state);
  return off;
}

export function exportPNG(state, w, h, filename) {
  const off = renderExport(state, w, h);
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, 'image/png');
}
