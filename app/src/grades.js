// Neon Shore Cover Studio — 6 color grades as canvas filter functions
export const grades = [
  {
    name: 'Vice Sunset',
    apply(ctx, w, h) {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.15 + 20);     // R boost
        data[i + 1] = Math.min(255, data[i + 1] * 1.05);   // G slight
        data[i + 2] = Math.min(255, data[i + 2] * 0.7);    // B reduce
      }
      ctx.putImageData(imgData, 0, 0);
      // Warm overlay
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(255, 120, 30, 0.18)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    },
  },
  {
    name: 'Neon Night',
    apply(ctx, w, h) {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 0.85 + 10);       // R
        data[i + 1] = Math.min(255, data[i + 1] * 0.7);     // G
        data[i + 2] = Math.min(255, data[i + 2] * 1.2 + 30); // B boost
      }
      ctx.putImageData(imgData, 0, 0);
      // Cyan/magenta glow
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = 'rgba(0, 255, 255, 0.12)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    },
  },
  {
    name: 'Teal Dusk',
    apply(ctx, w, h) {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 0.6);             // R reduce
        data[i + 1] = Math.min(255, data[i + 1] * 1.05);    // G
        data[i + 2] = Math.min(255, data[i + 2] * 1.15 + 15); // B boost
      }
      ctx.putImageData(imgData, 0, 0);
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(0, 180, 160, 0.2)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    },
  },
  {
    name: 'Golden Hour',
    apply(ctx, w, h) {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.2 + 25);        // R boost
        data[i + 1] = Math.min(255, data[i + 1] * 1.1 + 10); // G boost
        data[i + 2] = Math.min(255, data[i + 2] * 0.6);     // B reduce
      }
      ctx.putImageData(imgData, 0, 0);
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(255, 200, 50, 0.15)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    },
  },
  {
    name: 'Magenta Rain',
    apply(ctx, w, h) {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.1 + 30);        // R boost
        data[i + 1] = Math.min(255, data[i + 1] * 0.6);     // G reduce
        data[i + 2] = Math.min(255, data[i + 2] * 1.15 + 20); // B boost
      }
      ctx.putImageData(imgData, 0, 0);
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = 'rgba(255, 0, 200, 0.14)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    },
  },
  {
    name: 'Mono Noir',
    apply(ctx, w, h) {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = Math.min(255, gray * 1.15 + 10);
      }
      ctx.putImageData(imgData, 0, 0);
      // High contrast vignette
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h));
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    },
  },
];

export function getGradeByName(name) {
  return grades.find((g) => g.name === name) || grades[0];
}

export function getGradeIndex(name) {
  return grades.findIndex((g) => g.name === name);
}