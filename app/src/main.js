// Neon Shore Cover Studio - Main UI Wiring
// File input, sample photos, panel selection, drag to pan, wheel/slider zoom,
// caption + subtitle inputs, font picker, layout picker, grade picker, export buttons, randomize

import { state, initState, addPhoto, addSamplePhoto, removePhoto, setCurrentPhoto, setPanels, getCurrentPhoto, getPanelTransform, setPanelTransform, resetPanelTransform, setLayout, setGrade, setFontFamily, setCaption, setSubtitle, setExportSize } from './state.js';
import { layouts, getLayout, getLayoutNames } from './layouts.js';
import { grades, getGrade, getGradeNames } from './grades.js';
import { renderPreview, downloadPNG } from './render.js';

const canvas = document.getElementById('preview');
const photoInput = document.getElementById('photoInput');
const photoStrip = document.getElementById('photoStrip');
const layoutSelect = document.getElementById('layoutSelect');
const gradeSelect = document.getElementById('gradeSelect');
const captionInput = document.getElementById('captionInput');
const subtitleInput = document.getElementById('subtitleInput');
const fontSelect = document.getElementById('fontSelect');
const zoomSlider = document.getElementById('zoomSlider');
const exportSquare = document.getElementById('exportSquare');
const exportPortrait = document.getElementById('exportPortrait');
const exportLandscape = document.getElementById('exportLandscape');
const randomizeBtn = document.getElementById('randomizeBtn');

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragPanelIndex = -1;
let dragStartTransform = null;

function populateLayoutSelect() {
  layoutSelect.innerHTML = '';
  getLayoutNames().forEach(({ id, name }) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = name;
    layoutSelect.appendChild(option);
  });
  layoutSelect.value = state.layoutId;
}

function populateGradeSelect() {
  gradeSelect.innerHTML = '';
  getGradeNames().forEach(({ id, name }) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = name;
    gradeSelect.appendChild(option);
  });
  gradeSelect.value = state.gradeId;
}

function updatePhotoStrip() {
  photoStrip.innerHTML = '';
  state.photos.forEach((photo, index) => {
    const img = document.createElement('img');
    img.src = photo.image.src;
    img.alt = photo.name;
    img.title = photo.name;
    if (index === state.currentPhotoIndex) {
      img.classList.add('active');
    }
    img.addEventListener('click', () => {
      setCurrentPhoto(index);
      updatePhotoStrip();
      updateLayoutForPhotoCount();
      render();
    });
    photoStrip.appendChild(img);
  });
}

function updateLayoutForPhotoCount() {
  const count = state.photos.length;
  const currentLayout = getLayout(state.layoutId);
  const panelCount = currentLayout.panels.length;

  // Auto-switch layout if photo count doesn't match panel count well
  if (count > 0 && count !== panelCount) {
    // Find a layout with matching or close panel count
    const matching = layouts.find(l => l.panels.length === count);
    if (matching) {
      setLayout(matching.id);
      layoutSelect.value = matching.id;
      updatePanels();
    }
  }
}

function updatePanels() {
  const layout = getLayout(state.layoutId);
  setPanels(layout.panels);
}

async function render() {
  const width = canvas.width;
  const height = canvas.height;
  await renderPreview(canvas, width, height);
}

function getPanelAtPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const layout = getLayout(state.layoutId);
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  for (let i = 0; i < layout.panels.length; i++) {
    const panel = layout.panels[i];
    const panelX = panel.x * canvas.width;
    const panelY = panel.y * canvas.height;
    const panelW = panel.w * canvas.width;
    const panelH = panel.h * canvas.height;

    const localX = x * scaleX;
    const localY = y * scaleY;

    if (localX >= panelX && localX <= panelX + panelW &&
        localY >= panelY && localY <= panelY + panelH) {
      return i;
    }
  }
  return -1;
}

function handlePointerDown(e) {
  const photo = getCurrentPhoto();
  if (!photo) return;

  const panelIndex = getPanelAtPoint(e.clientX, e.clientY);
  if (panelIndex === -1) return;

  dragPanelIndex = panelIndex;
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragStartTransform = { ...getPanelTransform(panelIndex) };

  canvas.style.cursor = 'grabbing';
  e.preventDefault();
}

function handlePointerMove(e) {
  if (!isDragging || dragPanelIndex === -1 || !dragStartTransform) return;

  const photo = getCurrentPhoto();
  if (!photo) return;

  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const layout = getLayout(state.layoutId);
  const panel = layout.panels[dragPanelIndex];
  const panelW = panel.w * canvas.width;
  const panelH = panel.h * canvas.height;

  const photoAspect = photo.width / photo.height;
  const panelAspect = panelW / panelH;

  let photoW, photoH;
  if (photoAspect > panelAspect) {
    photoH = photo.height / dragStartTransform.scale;
    photoW = photoH * panelAspect;
  } else {
    photoW = photo.width / dragStartTransform.scale;
    photoH = photoW / panelAspect;
  }

  const offsetX = -(dx * scaleX) / photoW;
  const offsetY = -(dy * scaleY) / photoH;

  setPanelTransform(dragPanelIndex, {
    offsetX: dragStartTransform.offsetX + offsetX,
    offsetY: dragStartTransform.offsetY + offsetY,
  });

  render();
}

function handlePointerUp() {
  if (isDragging) {
    isDragging = false;
    dragPanelIndex = -1;
    dragStartTransform = null;
    canvas.style.cursor = 'grab';
  }
}

function handleWheel(e) {
  const photo = getCurrentPhoto();
  if (!photo) return;

  const panelIndex = getPanelAtPoint(e.clientX, e.clientY);
  if (panelIndex === -1) return;

  e.preventDefault();

  const transform = getPanelTransform(panelIndex);
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
  const newScale = Math.max(1, Math.min(5, transform.scale * zoomFactor));

  setPanelTransform(panelIndex, { scale: newScale });
  // Update zoom slider to reflect the change
  zoomSlider.value = newScale.toFixed(2);
  render();
}

function handleZoomSlider(e) {
  const photo = getCurrentPhoto();
  if (!photo) return;

  const panelIndex = state.currentPhotoIndex >= 0 ? 0 : -1;
  // Apply zoom to all panels for simplicity
  state.panels.forEach((_, i) => {
    const transform = getPanelTransform(i);
    setPanelTransform(i, { scale: parseFloat(e.target.value) });
  });
  render();
}

async function handleFileInput(e) {
  const files = Array.from(e.target.files);
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      await addPhoto(file, file.name);
    }
  }
  updatePhotoStrip();
  updateLayoutForPhotoCount();
  await render();
  photoInput.value = '';
}

async function loadSamplePhotos() {
  await addSamplePhoto('boulevard.jpg');
  await addSamplePhoto('pier.jpg');
  updatePhotoStrip();
  updateLayoutForPhotoCount();
  await render();
}

function handleLayoutChange(e) {
  setLayout(e.target.value);
  updatePanels();
  render();
}

function handleGradeChange(e) {
  setGrade(e.target.value);
  render();
}

function handleCaptionChange(e) {
  setCaption(e.target.value);
  render();
}

function handleSubtitleChange(e) {
  setSubtitle(e.target.value);
  render();
}

function handleFontChange(e) {
  setFontFamily(e.target.value);
  render();
}

async function handleExportSquare() {
  await downloadPNG(1080, 1080, 'neon-shore-cover-square.png');
}

async function handleExportPortrait() {
  await downloadPNG(1080, 1350, 'neon-shore-cover-portrait.png');
}

async function handleExportLandscape() {
  await downloadPNG(1920, 1080, 'neon-shore-cover-landscape.png');
}

function handleRandomize() {
  // Random layout
  const randomLayout = layouts[Math.floor(Math.random() * layouts.length)];
  setLayout(randomLayout.id);
  layoutSelect.value = randomLayout.id;

  // Random grade
  const randomGrade = grades[Math.floor(Math.random() * grades.length)];
  setGrade(randomGrade.id);
  gradeSelect.value = randomGrade.id;

  // Random font
  const fonts = ['ArchivoBlack', 'Anton', 'BebasNeue', 'Pacifico'];
  const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
  setFontFamily(randomFont);
  fontSelect.value = randomFont;

  // Random caption
  const captions = [
    'Sunset Heist', 'Neon Shore', 'Vice Dreams', 'Midnight Run',
    'Golden Coast', 'Digital Drift', 'Chrome Hearts', 'Electric Soul'
  ];
  const randomCaption = captions[Math.floor(Math.random() * captions.length)];
  setCaption(randomCaption);
  captionInput.value = randomCaption;

  // Random subtitle
  const subtitles = [
    'Welcome to the Night', 'Where Dreams Burn Bright', 'No Rules Tonight',
    'The City Never Sleeps', 'Chase the Horizon', 'Live Fast, Die Neon'
  ];
  const randomSubtitle = subtitles[Math.floor(Math.random() * subtitles.length)];
  setSubtitle(randomSubtitle);
  subtitleInput.value = randomSubtitle;

  // Reset panel transforms
  state.panels.forEach((_, i) => resetPanelTransform(i));
  zoomSlider.value = 1;

  updatePanels();
  render();
}

// Event listeners
photoInput.addEventListener('change', handleFileInput);

document.querySelectorAll('.sample-buttons button').forEach(btn => {
  btn.addEventListener('click', async () => {
    await addSamplePhoto(btn.dataset.sample);
    updatePhotoStrip();
    updateLayoutForPhotoCount();
    await render();
  });
});

layoutSelect.addEventListener('change', handleLayoutChange);
gradeSelect.addEventListener('change', handleGradeChange);
captionInput.addEventListener('input', handleCaptionChange);
subtitleInput.addEventListener('input', handleSubtitleChange);
fontSelect.addEventListener('change', handleFontChange);
zoomSlider.addEventListener('input', handleZoomSlider);

exportSquare.addEventListener('click', handleExportSquare);
exportPortrait.addEventListener('click', handleExportPortrait);
exportLandscape.addEventListener('click', handleExportLandscape);
randomizeBtn.addEventListener('click', handleRandomize);

canvas.addEventListener('pointerdown', handlePointerDown);
window.addEventListener('pointermove', handlePointerMove);
window.addEventListener('pointerup', handlePointerUp);
canvas.addEventListener('wheel', handleWheel, { passive: false });

canvas.style.cursor = 'grab';

// Initialize
initState();
populateLayoutSelect();
populateGradeSelect();
loadSamplePhotos();

console.log('Neon Shore Cover Studio initialized');