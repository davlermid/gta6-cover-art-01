// Neon Shore Cover Studio - Color Grades
// 6 color grades applied on canvas via pixel manipulation

export const grades = [
  {
    id: 'vice-sunset',
    name: 'Vice Sunset',
    // Hot pink/orange sunset vibe
    apply: (data, width, height) => {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Luminance
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // Sunset gradient map
        if (lum < 64) {
          data[i] = Math.min(255, lum * 0.8 + 40);     // Deep reds
          data[i + 1] = Math.min(255, lum * 0.3 + 10);
          data[i + 2] = Math.min(255, lum * 0.5 + 20);
        } else if (lum < 128) {
          data[i] = Math.min(255, lum * 1.2 + 20);     // Oranges
          data[i + 1] = Math.min(255, lum * 0.6 + 30);
          data[i + 2] = Math.min(255, lum * 0.2 + 10);
        } else if (lum < 192) {
          data[i] = 255;                               // Hot pinks
          data[i + 1] = Math.min(255, lum * 0.4 + 60);
          data[i + 2] = Math.min(255, lum * 0.7 + 80);
        } else {
          data[i] = 255;                               // Bright highlights
          data[i + 1] = Math.min(255, lum * 0.6 + 100);
          data[i + 2] = Math.min(255, lum * 0.5 + 120);
        }
      }
    },
  },
  {
    id: 'neon-night',
    name: 'Neon Night',
    // Deep blues with cyan/pink neon accents
    apply: (data, width, height) => {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (lum < 64) {
          data[i] = Math.min(255, lum * 0.2 + 10);     // Deep navy
          data[i + 1] = Math.min(255, lum * 0.1 + 5);
          data[i + 2] = Math.min(255, lum * 0.5 + 30);
        } else if (lum < 128) {
          data[i] = Math.min(255, lum * 0.4 + 20);     // Teal midtones
          data[i + 1] = Math.min(255, lum * 0.8 + 40);
          data[i + 2] = Math.min(255, lum * 0.6 + 60);
        } else if (lum < 192) {
          data[i] = Math.min(255, lum * 0.7 + 60);     // Cyan highlights
          data[i + 1] = Math.min(255, lum * 1.0 + 80);
          data[i + 2] = Math.min(255, lum * 0.8 + 100);
        } else {
          data[i] = 255;                               // Pink neon blows
          data[i + 1] = Math.min(255, lum * 0.3 + 50);
          data[i + 2] = Math.min(255, lum * 0.9 + 150);
        }
      }
    },
  },
  {
    id: 'teal-dusk',
    name: 'Teal Dusk',
    // Teal/orange cinematic look
    apply: (data, width, height) => {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (lum < 64) {
          data[i] = Math.min(255, lum * 0.3 + 15);     // Dark teal shadows
          data[i + 1] = Math.min(255, lum * 0.5 + 25);
          data[i + 2] = Math.min(255, lum * 0.4 + 20);
        } else if (lum < 128) {
          data[i] = Math.min(255, lum * 0.6 + 30);     // Teal midtones
          data[i + 1] = Math.min(255, lum * 0.9 + 50);
          data[i + 2] = Math.min(255, lum * 0.5 + 30);
        } else if (lum < 192) {
          data[i] = Math.min(255, lum * 1.1 + 60);     // Orange-teal highlights
          data[i + 1] = Math.min(255, lum * 0.8 + 80);
          data[i + 2] = Math.min(255, lum * 0.3 + 40);
        } else {
          data[i] = 255;                               // Warm highlights
          data[i + 1] = Math.min(255, lum * 0.9 + 120);
          data[i + 2] = Math.min(255, lum * 0.4 + 60);
        }
      }
    },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    // Warm golden sunlight
    apply: (data, width, height) => {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (lum < 64) {
          data[i] = Math.min(255, lum * 1.0 + 40);     // Deep gold shadows
          data[i + 1] = Math.min(255, lum * 0.5 + 20);
          data[i + 2] = Math.min(255, lum * 0.2 + 5);
        } else if (lum < 128) {
          data[i] = Math.min(255, lum * 1.2 + 60);     // Rich gold midtones
          data[i + 1] = Math.min(255, lum * 0.9 + 50);
          data[i + 2] = Math.min(255, lum * 0.3 + 15);
        } else if (lum < 192) {
          data[i] = 255;                               // Bright gold highlights
          data[i + 1] = Math.min(255, lum * 1.0 + 100);
          data[i + 2] = Math.min(255, lum * 0.5 + 40);
        } else {
          data[i] = 255;                               // Blown highlights
          data[i + 1] = 255;
          data[i + 2] = Math.min(255, lum * 0.7 + 80);
        }
      }
    },
  },
  {
    id: 'magenta-rain',
    name: 'Magenta Rain',
    // Purple/magenta with cyan accents
    apply: (data, width, height) => {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (lum < 64) {
          data[i] = Math.min(255, lum * 0.6 + 30);     // Deep purple shadows
          data[i + 1] = Math.min(255, lum * 0.1 + 5);
          data[i + 2] = Math.min(255, lum * 0.8 + 40);
        } else if (lum < 128) {
          data[i] = Math.min(255, lum * 1.0 + 50);     // Magenta midtones
          data[i + 1] = Math.min(255, lum * 0.3 + 20);
          data[i + 2] = Math.min(255, lum * 0.9 + 60);
        } else if (lum < 192) {
          data[i] = 255;                               // Bright magenta
          data[i + 1] = Math.min(255, lum * 0.5 + 60);
          data[i + 2] = Math.min(255, lum * 0.7 + 100);
        } else {
          data[i] = 255;                               // Cyan-magenta highlights
          data[i + 1] = Math.min(255, lum * 0.7 + 120);
          data[i + 2] = 255;
        }
      }
    },
  },
  {
    id: 'mono-noir',
    name: 'Mono Noir',
    // High contrast black & white with slight tint
    apply: (data, width, height) => {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // High contrast S-curve
        let contrast = lum / 255;
        contrast = contrast < 0.5
          ? 2 * contrast * contrast
          : 1 - 2 * (1 - contrast) * (1 - contrast);
        contrast = Math.round(contrast * 255);

        // Slight cyan tint in shadows, warm in highlights
        if (contrast < 128) {
          data[i] = Math.min(255, contrast * 0.95);
          data[i + 1] = Math.min(255, contrast * 1.02);
          data[i + 2] = Math.min(255, contrast * 1.05);
        } else {
          data[i] = Math.min(255, contrast * 1.03);
          data[i + 1] = Math.min(255, contrast * 1.01);
          data[i + 2] = Math.min(255, contrast * 0.97);
        }
      }
    },
  },
];

export function getGrade(id) {
  return grades.find(g => g.id === id) || grades[0];
}

export function getGradeNames() {
  return grades.map(g => ({ id: g.id, name: g.name }));
}

export function getAllGrades() {
  return [...grades];
}

export function getNextGrade(currentId) {
  const index = grades.findIndex(g => g.id === currentId);
  const nextIndex = (index + 1) % grades.length;
  return grades[nextIndex].id;
}

export function getPrevGrade(currentId) {
  const index = grades.findIndex(g => g.id === currentId);
  const prevIndex = (index - 1 + grades.length) % grades.length;
  return grades[prevIndex].id;
}