// Neon Shore Cover Studio - Color Grades
// 6 color grades applied on canvas for that authentic GTA 6 Vice City aesthetic
// Each grade manipulates pixel data directly for a distinctive look

export const grades = [
  {
    name: 'Vice Sunset',
    apply: (ctx, width, height) => {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = Math.min(255, r * 1.2 + 30);
        data[i + 1] = Math.min(255, g * 0.9 + 10);
        data[i + 2] = Math.min(255, b * 0.7);
      }
      ctx.putImageData(imgData, 0, 0);
    },
  },
  {
    name: 'Neon Night',
    apply: (ctx, width, height) => {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = Math.min(255, r * 0.8 + 20);
        data[i + 1] = Math.min(255, g * 0.6 + 40);
        data[i + 2] = Math.min(255, b * 1.3 + 60);
      }
      ctx.putImageData(imgData, 0, 0);
    },
  },
  {
    name: 'Teal Dusk',
    apply: (ctx, width, height) => {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = Math.min(255, gray * 0.3);
        data[i + 1] = Math.min(255, gray * 0.8 + 30);
        data[i + 2] = Math.min(255, gray * 1.0 + 20);
      }
      ctx.putImageData(imgData, 0, 0);
    },
  },
  {
    name: 'Golden Hour',
    apply: (ctx, width, height) => {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = Math.min(255, r * 1.3 + 40);
        data[i + 1] = Math.min(255, g * 1.1 + 20);
        data[i + 2] = Math.min(255, b * 0.6);
      }
      ctx.putImageData(imgData, 0, 0);
    },
  },
  {
    name: 'Magenta Rain',
    apply: (ctx, width, height) => {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = Math.min(255, gray * 1.1 + 50);
        data[i + 1] = Math.min(255, gray * 0.4);
        data[i + 2] = Math.min(255, gray * 0.9 + 60);
      }
      ctx.putImageData(imgData, 0, 0);
    },
  },
  {
    name: 'Mono Noir',
    apply: (ctx, width, height) => {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const contrast = gray * 1.4 - 40;
        const val = Math.max(0, Math.min(255, contrast));
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
      ctx.putImageData(imgData, 0, 0);
    },
  },
];