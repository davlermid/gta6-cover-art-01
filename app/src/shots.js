// Minimal shots helper for screenshot script compatibility
// Provides URL parsing for automated shots

export function parseShotQuery(search) {
  const params = new URLSearchParams(search);
  return {
    shot: params.get('shot') || 'editor',
    photo: params.get('photo') || 'pier',
    caption: params.get('caption') || 'Vice City Nights',
    subtitle: params.get('subtitle') || 'Neon Shore',
    layout: parseInt(params.get('layout') || '0', 10),
    grade: parseInt(params.get('grade') || '0', 10),
    font: params.get('font') || 'Archivo Black',
    width: parseInt(params.get('w') || '1080', 10),
    height: parseInt(params.get('h') || '1080', 10),
  };
}

export function buildShotURL(options) {
  const params = new URLSearchParams();
  if (options.shot) params.set('shot', options.shot);
  if (options.photo) params.set('photo', options.photo);
  if (options.caption) params.set('caption', options.caption);
  if (options.subtitle) params.set('subtitle', options.subtitle);
  if (options.layout !== undefined) params.set('layout', String(options.layout));
  if (options.grade !== undefined) params.set('grade', String(options.grade));
  if (options.font) params.set('font', options.font);
  if (options.width) params.set('w', String(options.width));
  if (options.height) params.set('h', String(options.height));
  return '?' + params.toString();
}