// Neon Shore Cover Studio — 6 panel layouts in normalized coordinates (0-1)
export const layouts = [
  {
    name: 'Hero',
    panels: [{ x: 0, y: 0, w: 1, h: 1 }],
  },
  {
    name: 'Duo Split',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 },
    ],
  },
  {
    name: 'Triptych',
    panels: [
      { x: 0, y: 0, w: 1/3, h: 1 },
      { x: 1/3, y: 0, w: 1/3, h: 1 },
      { x: 2/3, y: 0, w: 1/3, h: 1 },
    ],
  },
  {
    name: 'Quad Grid',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  {
    name: 'Diagonal Slash',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.6 },
      { x: 0, y: 0.6, w: 1, h: 0.4 },
    ],
  },
  {
    name: 'Filmstrip',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.25 },
      { x: 0, y: 0.25, w: 1, h: 0.25 },
      { x: 0, y: 0.5, w: 1, h: 0.25 },
      { x: 0, y: 0.75, w: 1, h: 0.25 },
    ],
  },
];

export function getLayoutByName(name) {
  return layouts.find((l) => l.name === name) || layouts[0];
}

export function getLayoutIndex(name) {
  return layouts.findIndex((l) => l.name === name);
}