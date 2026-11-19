// Neon Shore Cover Studio - Layout Definitions
// 6 multi-panel layouts as normalized rectangles (0-1 coordinates)

export const layouts = [
  {
    id: 'hero',
    name: 'Single Hero',
    panels: [
      { x: 0, y: 0, w: 1, h: 1 },
    ],
  },
  {
    id: 'duo-split',
    name: 'Duo Split',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 },
    ],
  },
  {
    id: 'triptych',
    name: 'Triptych',
    panels: [
      { x: 0, y: 0, w: 1/3, h: 1 },
      { x: 1/3, y: 0, w: 1/3, h: 1 },
      { x: 2/3, y: 0, w: 1/3, h: 1 },
    ],
  },
  {
    id: 'quad-grid',
    name: 'Quad Grid',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  {
    id: 'diagonal-slash',
    name: 'Diagonal Slash',
    panels: [
      { x: 0, y: 0, w: 0.7, h: 1 },
      { x: 0.3, y: 0, w: 0.7, h: 1 },
    ],
  },
  {
    id: 'filmstrip',
    name: 'Filmstrip',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.25 },
      { x: 0, y: 0.25, w: 1, h: 0.25 },
      { x: 0, y: 0.5, w: 1, h: 0.25 },
      { x: 0, y: 0.75, w: 1, h: 0.25 },
    ],
  },
];

export function getLayout(id) {
  return layouts.find(l => l.id === id) || layouts[0];
}

export function getLayoutNames() {
  return layouts.map(l => ({ id: l.id, name: l.name }));
}

export function getLayoutsByPanelCount(count) {
  return layouts.filter(l => l.panels.length === count);
}

export function getDefaultLayoutForCount(count) {
  const matching = getLayoutsByPanelCount(count);
  return matching[0] || layouts[0];
}