// Neon Shore Cover Studio - App State
// Manages photos, panels, caption, layout, grade, fonts

export const state = {
  photos: [],
  currentPhotoIndex: -1,
  panels: [],
  caption: '',
  subtitle: '',
  layoutIndex: 0,
  gradeIndex: 0,
  fontIndex: 0,
  exportSizes: [
    { name: 'Square (1080x1080)', width: 1080, height: 1080 },
    { name: 'Portrait (1080x1350)', width: 1080, height: 1350 },
    { name: 'Landscape (1920x1080)', width: 1920, height: 1080 },
  ],
  fonts: [
    { name: 'Archivo Black', family: 'ArchivoBlack', file: 'ArchivoBlack-Regular.ttf' },
    { name: 'Anton', family: 'Anton', file: 'Anton-Regular.ttf' },
    { name: 'Bebas Neue', family: 'BebasNeue', file: 'BebasNeue-Regular.ttf' },
    { name: 'Pacifico', family: 'Pacifico', file: 'Pacifico-Regular.ttf' },
  ],
};

export function addPhoto(file, name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const photo = { file, name, img, width: img.naturalWidth, height: img.naturalHeight };
      state.photos.push(photo);
      if (state.currentPhotoIndex === -1) {
        state.currentPhotoIndex = 0;
        initPanelsForPhoto(photo);
      }
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
    photoIndex: 0,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragStartOffsetX: 0,
    dragStartOffsetY: 0,
  }));
}

export function selectPhoto(index) {
  if (index >= 0 && index < state.photos.length) {
    state.currentPhotoIndex = index;
    initPanelsForPhoto(state.photos[index]);
  }
}

export function setLayout(index) {
  state.layoutIndex = index;
  const photo = state.photos[state.currentPhotoIndex];
  if (photo) initPanelsForPhoto(photo);
}

export function setGrade(index) {
  state.gradeIndex = index;
}

export function setFont(index) {
  state.fontIndex = index;
}

export function setCaption(text) {
  state.caption = text;
}

export function setSubtitle(text) {
  state.subtitle = text;
}

export function getCurrentPhoto() {
  return state.photos[state.currentPhotoIndex];
}

export function getCurrentLayout() {
  return layouts[state.layoutIndex];
}

export function getCurrentGrade() {
  return grades[state.gradeIndex];
}

export function getCurrentFont() {
  return state.fonts[state.fontIndex];
}

export function randomize() {
  if (state.photos.length === 0) return;
  state.currentPhotoIndex = Math.floor(Math.random() * state.photos.length);
  state.layoutIndex = Math.floor(Math.random() * layouts.length);
  state.gradeIndex = Math.floor(Math.random() * grades.length);
  state.fontIndex = Math.floor(Math.random() * state.fonts.length);
  const captions = ['NEON SHORE', 'MIDNIGHT RUN', 'VICE CITY', 'SUNSET HEIST', 'NEON DREAMS', 'CRIMSON TIDE'];
  const subtitles = ['Grand Theft Auto VI Style', 'Cover Art Studio', 'Neon Nights', 'Vice Vibes', 'Midnight Drive', 'Ocean Drive'];
  state.caption = captions[Math.floor(Math.random() * captions.length)];
  state.subtitle = subtitles[Math.floor(Math.random() * subtitles.length)];
  initPanelsForPhoto(state.photos[state.currentPhotoIndex]);
}

export function reset() {
  state.photos = [];
  state.currentPhotoIndex = -1;
  state.panels = [];
  state.caption = '';
  state.subtitle = '';
  state.layoutIndex = 0;
  state.gradeIndex = 0;
  state.fontIndex = 0;
}

// Import layouts and grades (circular dependency avoided by importing here)
import { layouts } from './layouts.js';
import { grades } from './grades.js';