// Neon Shore Cover Studio - Shots Helper
// Small helper used by the screenshot script

export function parseShotQuery(search) {
  const params = new URLSearchParams(search);
  return {
    shot: params.get('shot') || 'editor',
    photo: params.get('photo') || 'pier',
    caption: decodeURIComponent(params.get('caption') || 'Neon Shore'),
    layout: parseInt(params.get('layout') || '0', 10),
    grade: parseInt(params.get('grade') || '0', 10),
  };
}