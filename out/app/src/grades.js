// The color grades: each is a photo filter plus a stack of gradient layers blended over the photo
// (soft-light / screen / multiply / overlay), all drawn on the canvas so the export matches the preview.

export const GRADES = {
  'vice-sunset': {
    name: 'Vice Sunset',
    filter: 'saturate(1.2) contrast(1.06)',
    layers: [
      { kind: 'lin', x0: 0, y0: 0, x1: 0, y1: 1, op: 'soft-light', stops: [[0, 'rgba(64,22,130,0.55)'], [0.55, 'rgba(255,94,58,0.22)'], [1, 'rgba(255,0,128,0.5)']] },
      { kind: 'lin', x0: 0, y0: 0, x1: 0, y1: 1, op: 'screen', stops: [[0, 'rgba(255,60,150,0)'], [0.75, 'rgba(255,60,150,0)'], [1, 'rgba(255,120,60,0.28)']] },
    ],
  },
  'neon-night': {
    name: 'Neon Night',
    filter: 'saturate(1.3) contrast(1.15) brightness(0.92)',
    layers: [
      { kind: 'lin', x0: 0, y0: 0, x1: 0, y1: 1, op: 'multiply', stops: [[0, 'rgba(24,16,64,0.75)'], [1, 'rgba(10,6,30,0.85)']] },
      { kind: 'lin', x0: 0, y0: 1, x1: 1, y1: 0, op: 'screen', stops: [[0, 'rgba(0,220,255,0.22)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(255,40,180,0.3)']] },
    ],
  },
  'golden-hour': {
    name: 'Golden Hour',
    filter: 'saturate(1.15) contrast(1.03) brightness(1.05)',
    layers: [
      { kind: 'lin', x0: 0, y0: 0, x1: 0, y1: 1, op: 'soft-light', stops: [[0, 'rgba(255,200,90,0.4)'], [1, 'rgba(255,110,40,0.4)']] },
      { kind: 'lin', x0: 0, y0: 1, x1: 0, y1: 0, op: 'overlay', stops: [[0, 'rgba(120,60,0,0.25)'], [1, 'rgba(0,0,0,0)']] },
    ],
  },
  'teal-pink': {
    name: 'Teal & Pink',
    filter: 'saturate(1.25) contrast(1.12)',
    layers: [
      { kind: 'lin', x0: 0, y0: 0, x1: 1, y1: 1, op: 'multiply', stops: [[0, 'rgba(0,150,170,0.55)'], [1, 'rgba(15,30,60,0.6)']] },
      { kind: 'lin', x0: 1, y0: 0, x1: 0, y1: 1, op: 'screen', stops: [[0, 'rgba(0,0,0,0)'], [1, 'rgba(255,70,160,0.32)']] },
    ],
  },
  'mono-ink': {
    name: 'Mono Ink',
    filter: 'grayscale(1) contrast(1.25) brightness(1.02)',
    layers: [
      { kind: 'lin', x0: 0, y0: 0, x1: 0, y1: 1, op: 'multiply', stops: [[0, 'rgba(210,200,220,0.35)'], [1, 'rgba(30,25,45,0.45)']] },
    ],
  },
  'candy-pop': {
    name: 'Candy Pop',
    filter: 'saturate(1.5) contrast(1.1) brightness(1.06)',
    layers: [
      { kind: 'lin', x0: 0, y0: 0, x1: 0, y1: 1, op: 'soft-light', stops: [[0, 'rgba(120,220,255,0.5)'], [1, 'rgba(255,110,200,0.5)']] },
      { kind: 'lin', x0: 0, y0: 1, x1: 1, y1: 0, op: 'overlay', stops: [[0, 'rgba(255,180,80,0.18)'], [1, 'rgba(0,0,0,0)']] },
    ],
  },
};

export const GRADE_IDS = Object.keys(GRADES);

/** Applies a grade's gradient layers across `x, y, w, h` on an already-drawn photo region. */
export function applyGradeLayers(ctx, x, y, w, h, grade) {
  for (const layer of grade.layers) {
    let grad;
    if (layer.kind === 'lin') {
      grad = ctx.createLinearGradient(x + layer.x0 * w, y + layer.y0 * h, x + layer.x1 * w, y + layer.y1 * h);
    } else {
      grad = ctx.createRadialGradient(x + layer.x0 * w, y + layer.y0 * h, 0, x + layer.x0 * w, y + layer.y0 * h, Math.max(w, h) * layer.r);
    }
    for (const [pos, color] of layer.stops) grad.addColorStop(pos, color);
    ctx.save();
    ctx.globalCompositeOperation = layer.op;
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
}
