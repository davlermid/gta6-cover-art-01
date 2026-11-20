// 6 multi-panel layouts for Neon Shore Cover Studio
// Each layout defines panels as normalized rectangles (0-1 coordinates)

export const layouts = [
  {
    name: 'Single Hero',
    description: 'One full-frame panel',
    panels: [
      { x: 0, y: 0, w: 1, h: 1 },
    ],
  },
  {
    name: 'Duo Split',
    description: 'Vertical split, two equal panels',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 },
    ],
  },
  {
    name: 'Triptych',
    description: 'Three vertical panels',
    panels: [
      { x: 0, y: 0, w: 1/3, h: 1 },
      { x: 1/3, y: 0, w: 1/3, h: 1 },
      { x: 2/3, y: 0, w: 1/3, h: 1 },
    ],
  },
  {
    name: 'Quad Grid',
    description: '2×2 grid of equal panels',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  {
    name: 'Diagonal Slash',
    description: 'Two panels split diagonally',
    panels: [
      { x: 0, y: 0, w: 1, h: 1, clip: 'lower' },
      { x: 0, y: 0, w: 1, h: 1, clip: 'upper' },
    ],
  },
  {
    name: 'Filmstrip',
    description: 'Horizontal strip of 4 panels',
    panels: [
      { x: 0, y: 0, w: 0.25, h: 1 },
      { x: 0.25, y: 0, w: 0.25, h: 1 },
      { x: 0.5, y: 0, w: 0.25, h: 1 },
      { x: 0.75, y: 0, w: 0.25, h: 1 },
    ],
  },
];

// Get layout by name (case-insensitive, useful for URL params)
export function getLayoutByName(name) {
  return layouts.find(l => l.name.toLowerCase() === name.toLowerCase());
}

// Get layout index by name
export function getLayoutIndexByName(name) {
  return layouts.findIndex(l => l.name.toLowerCase() === name.toLowerCase());
}