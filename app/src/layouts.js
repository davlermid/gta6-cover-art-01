// Neon Shore Cover Studio - Layouts
// 6 multi-panel layouts as panel rectangles in normalized coords (0-1)
// Each layout has unique panel arrangements for different cover styles

export const layouts = [
  {
    name: 'Single Hero',
    panels: [
      { x: 0, y: 0, w: 1, h: 1 },
    ],
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
      { x: 0, y: 0, w: 0.7, h: 0.7 },
      { x: 0.3, y: 0.3, w: 0.7, h: 0.7 },
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