// App state management for Neon Shore Cover Studio

export const state = {
  // Photo management
  photos: new Map(), // key -> { img, name, width, height }
  currentPhotoKey: null,
  
  // Panel data for multi-panel layouts
  panels: [], // array of { key, crop: {x, y, scale}, photoKey }
  
  // Text
  caption: 'Vice City Nights',
  subtitle: 'Neon Shore',
  
  // Layout & Grade
  layoutIndex: 0,
  gradeIndex: 0,
  
  // Font
  fontFamily: 'Archivo Black',
  
  // Canvas
  canvasWidth: 1080,
  canvasHeight: 1080,
  
  // Interaction
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  activePanelIndex: 0,
  
  // Zoom per panel
  panelZooms: [], // array of scale values
  
  // Available fonts
  fonts: [
    { name: 'Archivo Black', family: 'Archivo Black' },
    { name: 'Anton', family: 'Anton' },
    { name: 'Bebas Neue', family: 'Bebas Neue' },
    { name: 'Pacifico', family: 'Pacifico' },
  ],
  
  // Layouts will be loaded from layouts.js
  layouts: [],
  
  // Grades will be loaded from grades.js
  grades: [],
};

export function resetState() {
  state.panels = [];
  state.panelZooms = [];
  state.currentPhotoKey = null;
  state.activePanelIndex = 0;
  state.caption = 'Vice City Nights';
  state.subtitle = 'Neon Shore';
  state.layoutIndex = 0;
  state.gradeIndex = 0;
  state.fontFamily = 'Archivo Black';
}

export function addPhoto(key, img, name) {
  state.photos.set(key, {
    img,
    name,
    width: img.width,
    height: img.height,
  });
  if (!state.currentPhotoKey) {
    state.currentPhotoKey = key;
  }
}

export function getCurrentPhoto() {
  return state.currentPhotoKey ? state.photos.get(state.currentPhotoKey) : null;
}

export function setLayout(index) {
  state.layoutIndex = Math.max(0, Math.min(index, state.layouts.length - 1));
  rebuildPanels();
}

export function setGrade(index) {
  state.gradeIndex = Math.max(0, Math.min(index, state.grades.length - 1));
}

export function setFont(family) {
  state.fontFamily = family;
}

export function setCaption(text) {
  state.caption = text;
}

export function setSubtitle(text) {
  state.subtitle = text;
}

export function setCanvasSize(w, h) {
  state.canvasWidth = w;
  state.canvasHeight = h;
}

export function rebuildPanels() {
  const layout = state.layouts[state.layoutIndex];
  if (!layout) return;
  
  const photo = getCurrentPhoto();
  if (!photo) return;
  
  state.panels = layout.panels.map((panelRect, i) => ({
    ...panelRect,
    photoKey: state.currentPhotoKey,
    crop: { x: 0.5, y: 0.5, scale: 1 },
  }));
  
  state.panelZooms = state.panels.map(() => 1);
  state.activePanelIndex = 0;
}

export function updatePanelCrop(panelIndex, dx, dy) {
  const panel = state.panels[panelIndex];
  if (!panel) return;
  
  const zoom = state.panelZooms[panelIndex] || 1;
  const sensitivity = 0.002 / zoom;
  
  panel.crop.x = Math.max(0, Math.min(1, panel.crop.x + dx * sensitivity));
  panel.crop.y = Math.max(0, Math.min(1, panel.crop.y + dy * sensitivity));
}

export function updatePanelZoom(panelIndex, delta) {
  const zoom = Math.max(1, Math.min(3, (state.panelZooms[panelIndex] || 1) + delta));
  state.panelZooms[panelIndex] = zoom;
  
  const panel = state.panels[panelIndex];
  if (panel) {
    panel.crop.scale = zoom;
  }
}

export function setActivePanel(index) {
  state.activePanelIndex = Math.max(0, Math.min(index, state.panels.length - 1));
}

// Get current photo key (useful for URL sharing)
export function getCurrentPhotoKey() {
  return state.currentPhotoKey;
}