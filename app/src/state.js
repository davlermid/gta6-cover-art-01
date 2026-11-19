// App state + undo/redo. State is plain JSON except panel images (kept in a side table by object id).

export const SAMPLES = [
  { file: 'samples/woman-car.jpg', name: 'Woman & Car' },
  { file: 'samples/man-rooftop.jpg', name: 'Rooftop' },
  { file: 'samples/friends-neon.jpg', name: 'Neon Friends' },
  { file: 'samples/man-pier.jpg', name: 'Pier' },
  { file: 'samples/boulevard.jpg', name: 'Boulevard' },
  { file: 'samples/pier.jpg', name: 'Boardwalk' },
];

export function defaultState() {
  return {
    layout: 'grid9',
    grade: 'vice-sunset',
    title: 'NEON SHORE',
    subtitle: 'a vice city story',
    titleStyle: 'gta', // 'gta' (white fill + thick black outline) | 'sunset' | 'white'
    titleFont: 'Archivo Black', // 'Archivo Black' | 'Anton' | 'Bebas Neue' | 'Pacifico'
    titleStroke: 0.14, // outline width as a fraction of font size
    titleSize: 62,
    titleY: 66, // percent from top for the title block
    badge: true,
    badgeText: 'City of Dreams',
    stars: 4,
    halftone: true,
    grain: true,
    vignette: true,
    border: 'white',
    gap: 1.4,
    panels: [], // per-panel: {sample: index|url|null, pan:{x,y}, zoom:1, grade:null}
  };
}

export function setPanelImage(state, index, img) {
  const panels = state.panels.slice();
  panels[index] = { ...(panels[index] || { pan: { x: 0, y: 0 }, zoom: 1 }), img: img || null };
  return { ...state, panels };
}

export function updatePanel(state, index, patch) {
  const panels = state.panels.slice();
  panels[index] = { ...(panels[index] || { pan: { x: 0, y: 0 }, zoom: 1 }), ...patch };
  return { ...state, panels };
}

/** History with undo/redo; holds up to 60 states. */
export function makeHistory(initial) {
  let past = [];
  let present = initial;
  let future = [];
  return {
    get: () => present,
    set(next) {
      past.push(present);
      if (past.length > 60) past.shift();
      future = [];
      present = next;
    },
    undo() {
      if (!past.length) return present;
      future.push(present);
      present = past.pop();
      return present;
    },
    redo() {
      if (!future.length) return present;
      past.push(present);
      present = future.pop();
      return present;
    },
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0,
  };
}
