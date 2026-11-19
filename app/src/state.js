// Neon Shore Cover Studio - App State
// Manages photos, panels, caption, layout, grade, fonts

export const state = {
  photos: [],
  currentPhotoIndex: 0,
  panels: [],
  caption: '',
  subtitle: '',
  layoutId: 'hero',
  gradeId: 'vice-sunset',
  fontFamily: 'ArchivoBlack',
  fontSize: 72,
  subtitleFontSize: 28,
  exportWidth: 1080,
  exportHeight: 1080,
  // Per-panel transforms
  panelTransforms: [],
};

export function initState() {
  state.panelTransforms = [];
}

export function addPhoto(file, name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const photo = {
        id: crypto.randomUUID(),
        name,
        image: img,
        width: img.width,
        height: img.height,
      };
      state.photos.push(photo);
      if (state.photos.length === 1) {
        state.currentPhotoIndex = 0;
      }
      resolve(photo);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function addSamplePhoto(name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const photo = {
        id: crypto.randomUUID(),
        name,
        image: img,
        width: img.width,
        height: img.height,
      };
      state.photos.push(photo);
      if (state.photos.length === 1) {
        state.currentPhotoIndex = 0;
      }
      resolve(photo);
    };
    img.onerror = reject;
    img.src = `samples/${name}`;
  });
}

export function removePhoto(index) {
  URL.revokeObjectURL(state.photos[index].image.src);
  state.photos.splice(index, 1);
  if (state.currentPhotoIndex >= state.photos.length) {
    state.currentPhotoIndex = Math.max(0, state.photos.length - 1);
  }
}

export function setCurrentPhoto(index) {
  if (index >= 0 && index < state.photos.length) {
    state.currentPhotoIndex = index;
  }
}

export function setPanels(panels) {
  state.panels = panels;
  // Initialize transforms for new panels
  state.panelTransforms = panels.map(() => ({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  }));
}

export function getCurrentPhoto() {
  return state.photos[state.currentPhotoIndex] || null;
}

export function getPanelTransform(panelIndex) {
  return state.panelTransforms[panelIndex] || { scale: 1, offsetX: 0, offsetY: 0 };
}

export function setPanelTransform(panelIndex, transform) {
  if (state.panelTransforms[panelIndex]) {
    state.panelTransforms[panelIndex] = { ...state.panelTransforms[panelIndex], ...transform };
  }
}

export function resetPanelTransform(panelIndex) {
  if (state.panelTransforms[panelIndex]) {
    state.panelTransforms[panelIndex] = { scale: 1, offsetX: 0, offsetY: 0 };
  }
}

export function setLayout(id) {
  state.layoutId = id;
}

export function setGrade(id) {
  state.gradeId = id;
}

export function setFontFamily(family) {
  state.fontFamily = family;
}

export function setCaption(text) {
  state.caption = text;
}

export function setSubtitle(text) {
  state.subtitle = text;
}

export function setExportSize(width, height) {
  state.exportWidth = width;
  state.exportHeight = height;
}

export function getPhotoCount() {
  return state.photos.length;
}

export function clearPhotos() {
  state.photos.forEach(p => URL.revokeObjectURL(p.image.src));
  state.photos = [];
  state.currentPhotoIndex = 0;
  state.panelTransforms = [];
}