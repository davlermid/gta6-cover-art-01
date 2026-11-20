// 6 color grades for Neon Shore Cover Studio
// Each grade is a function that takes (ctx, width, height) and applies a look

export const grades = [
  {
    name: 'Vice Sunset',
    description: 'Hot pink/orange sunset vibes',
    apply: (ctx, w, h) => {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Sunset tint: boost reds, warm mids, cool shadows slightly
        data[i] = Math.min(255, r * 1.15 + 20);
        data[i + 1] = Math.min(255, g * 0.95 + 10);
        data[i + 2] = Math.min(255, b * 0.7);
        // Slight contrast boost
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const factor = 1.15;
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
      }
      ctx.putImageData(imgData, 0, 0);
      // Overlay gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(255, 42, 109, 0.15)');
      grad.addColorStop(0.5, 'rgba(255, 165, 0, 0.08)');
      grad.addColorStop(1, 'rgba(255, 42, 109, 0.1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    name: 'Neon Night',
    description: 'Deep cyan/magenta night glow',
    apply: (ctx, w, h) => {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Neon night: cyan/magenta split toning
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 128) {
          // Highlights -> magenta
          data[i] = Math.min(255, r * 1.1 + 30);
          data[i + 1] = Math.min(255, g * 0.7);
          data[i + 2] = Math.min(255, b * 1.2 + 20);
        } else {
          // Shadows -> cyan
          data[i] = Math.min(255, r * 0.6);
          data[i + 1] = Math.min(255, g * 1.1 + 20);
          data[i + 2] = Math.min(255, b * 1.15 + 15);
        }
        // Contrast
        const factor = 1.2;
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
      }
      ctx.putImageData(imgData, 0, 0);
      // Vignette
      const vignette = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)*0.7);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    name: 'Teal Dusk',
    description: 'Teal and orange cinematic look',
    apply: (ctx, w, h) => {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 140) {
          // Highlights -> warm orange
          data[i] = Math.min(255, r * 1.1 + 15);
          data[i + 1] = Math.min(255, g * 0.9 + 10);
          data[i + 2] = Math.min(255, b * 0.6);
        } else if (lum < 100) {
          // Shadows -> teal
          data[i] = Math.min(255, r * 0.5);
          data[i + 1] = Math.min(255, g * 1.05 + 10);
          data[i + 2] = Math.min(255, b * 1.1 + 15);
        } else {
          // Mids -> slight teal push
          data[i] = Math.min(255, r * 0.9);
          data[i + 1] = Math.min(255, g * 1.02);
          data[i + 2] = Math.min(255, b * 1.05);
        }
      }
      ctx.putImageData(imgData, 0, 0);
      // Subtle teal overlay
      ctx.fillStyle = 'rgba(0, 180, 180, 0.08)';
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    name: 'Golden Hour',
    description: 'Warm golden sunlight',
    apply: (ctx, w, h) => {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.2 + 25);
        data[i + 1] = Math.min(255, data[i + 1] * 1.1 + 15);
        data[i + 2] = Math.min(255, data[i + 2] * 0.75);
        // Soft contrast
        const factor = 1.1;
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
      }
      ctx.putImageData(imgData, 0, 0);
      // Golden radial gradient
      const grad = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, Math.max(w, h) * 0.8);
      grad.addColorStop(0, 'rgba(255, 215, 0, 0.25)');
      grad.addColorStop(0.5, 'rgba(255, 165, 0, 0.12)');
      grad.addColorStop(1, 'rgba(255, 100, 0, 0.05)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    name: 'Magenta Rain',
    description: 'Wet neon magenta streets',
    apply: (ctx, w, h) => {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        // Magenta shift
        data[i] = Math.min(255, r * 1.15 + (lum > 128 ? 20 : 10));
        data[i + 1] = Math.min(255, g * 0.65);
        data[i + 2] = Math.min(255, b * 1.2 + (lum > 128 ? 30 : 15));
        // High contrast
        const factor = 1.25;
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
      }
      ctx.putImageData(imgData, 0, 0);
      // Scanlines for "rain" effect
      ctx.strokeStyle = 'rgba(255, 0, 128, 0.03)';
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    },
  },
  {
    name: 'Mono Noir',
    description: 'High-contrast black & white',
    apply: (ctx, w, h) => {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Luminance with BT.709 weights
        let lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        // High contrast S-curve
        lum = lum / 255;
        lum = lum < 0.5 ? 2 * lum * lum : 1 - 2 * (1 - lum) * (1 - lum);
        lum = Math.min(255, Math.max(0, lum * 255));
        // Slight selenium toning (cool shadows, warm highlights)
        if (lum < 100) {
          data[i] = lum * 0.95;
          data[i + 1] = lum * 0.98;
          data[i + 2] = lum * 1.05;
        } else if (lum > 180) {
          data[i] = Math.min(255, lum * 1.05);
          data[i + 1] = Math.min(255, lum * 1.02);
          data[i + 2] = lum * 0.95;
        } else {
          data[i] = data[i + 1] = data[i + 2] = lum;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      // Heavy vignette
      const vignette = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)*0.6);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(0.7, 'rgba(0,0,0,0.2)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
    },
  },
];

// Get grade by name (case-insensitive, useful for URL params)
export function getGradeByName(name) {
  return grades.find(g => g.name.toLowerCase() === name.toLowerCase());
}

// Get grade index by name
export function getGradeIndexByName(name) {
  return grades.findIndex(g => g.name.toLowerCase() === name.toLowerCase());
}