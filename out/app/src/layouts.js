// Layouts: each returns a list of panels (normalized rects within the cover) plus where the title block sits.
// Rects are fractions {x, y, w, h} of the cover; a panel of null w/h means the title block owns the space.

export const LAYOUTS = {
  grid9: {
    name: '9-Panel Grid',
    panels: 9,
    rects: (n) => grid(3, 3, n),
    title: { x: 0.04, y: 0.66, w: 0.92, h: 0.3 },
  },
  grid4: {
    name: '4-Panel Grid',
    panels: 4,
    rects: (n) => grid(2, 2, n),
    title: { x: 0.04, y: 0.68, w: 0.92, h: 0.28 },
  },
  'hero-three': {
    name: 'Hero & Three',
    panels: 4,
    rects: (n) => [
      { x: 0.03, y: 0.03, w: 0.62, h: 0.6 },
      { x: 0.67, y: 0.03, w: 0.3, h: 0.19 },
      { x: 0.67, y: 0.235, w: 0.3, h: 0.19 },
      { x: 0.67, y: 0.44, w: 0.3, h: 0.19 },
    ][n],
    title: { x: 0.04, y: 0.67, w: 0.92, h: 0.29 },
  },
  'full-bleed': {
    name: 'Full Bleed',
    panels: 1,
    rects: () => [{ x: 0, y: 0, w: 1, h: 1 }],
    title: { x: 0.05, y: 0.6, w: 0.9, h: 0.36 },
  },
  'snapshot': {
    name: 'Tilted Snapshots',
    panels: 4,
    rects: (n) => {
      const base = [
        { x: 0.04, y: 0.05, w: 0.46, h: 0.42, tilt: -5 },
        { x: 0.5, y: 0.09, w: 0.46, h: 0.4, tilt: 4 },
        { x: 0.07, y: 0.34, w: 0.44, h: 0.4, tilt: 3 },
        { x: 0.52, y: 0.4, w: 0.44, h: 0.4, tilt: -4 },
      ][n];
      return { ...base, tilt: base.tilt };
    },
    title: { x: 0.04, y: 0.72, w: 0.92, h: 0.25 },
  },
  'split-duo': {
    name: 'Split Duo',
    panels: 2,
    rects: (n) => [{ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 }][n],
    title: { x: 0.05, y: 0.62, w: 0.9, h: 0.34, band: true },
  },
};

export const LAYOUT_IDS = Object.keys(LAYOUTS);

/** An n x m grid of panel rects (column-major so panels fill down then across). */
function grid(cols, rows, n) {
  const gap = 0.012;
  const cw = (1 - gap * (cols - 1)) / cols;
  const ch = (1 - gap * (rows - 1)) / rows;
  const col = n % cols;
  const row = Math.floor(n / cols);
  return { x: col * (cw + gap), y: row * (ch + gap), w: cw, h: ch };
}
