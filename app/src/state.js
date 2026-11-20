// Neon Shore Cover Studio — app state
import { layouts } from './layouts.js';
import { grades } from './grades.js';

export const state = {
  photos: [],
  currentPhotoIndex: -1,
  panels: [],
  caption: '',
  subtitle: '',
  layoutIndex: 0,
  gradeIndex: 0,
  fontFamily: 'Archivo Black',
  exportSizes: [
    { name: 'Square (1080x1080)', width: 1080, height: 1080 },
    { name: 'Portrait (1080x1350)', width: 1080, height: 1350 },
    { name: 'Landscape (1920x1080)', width: 1920, height: 1080 },
  ],
};

export function addPhoto(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const photo = { file, img, name: file.name };
      state.photos.push(photo);
      state.currentPhotoIndex = state.photos.length - 1;
      initPanelsForPhoto(photo);
      resolve(photo);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function initPanelsForPhoto(photo) {
  const layout = layouts[state.layoutIndex];
  state.panels = layout.panels.map((panel, i) => ({
    ...panel,
    photoIndex: state.currentPhotoIndex,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    selected: i === 0,
  }));
}

export function selectPanel(index) {
  state.panels.forEach((p, i) => (p.selected = i === index));
}

export function getCurrentPhoto() {
  if (state.currentPhotoIndex < 0 || state.currentPhotoIndex >= state.photos.length) return null;
  return state.photos[state.currentPhotoIndex];
}

export function getSelectedPanel() {
  return state.panels.find((p) => p.selected) || state.panels[0];
}

export function setLayout(index) {
  state.layoutIndex = index;
  const photo = getCurrentPhoto();
  if (photo) initPanelsForPhoto(photo);
}

export function setGrade(index) {
  state.gradeIndex = index;
}

export function setFontFamily(name) {
  state.fontFamily = name;
}

export function randomize() {
  state.layoutIndex = Math.floor(Math.random() * layouts.length);
  state.gradeIndex = Math.floor(Math.random() * grades.length);
  const photo = getCurrentPhoto();
  if (photo) initPanelsForPhoto(photo);
}

export function clearAll() {
  state.photos.forEach((p) => URL.revokeObjectURL(p.img.src));
  state.photos = [];
  state.currentPhotoIndex = -1;
  state.panels = [];
  state.caption = '';
  state.subtitle = '';
}