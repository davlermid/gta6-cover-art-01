// Neon Shore Cover Studio - Shots Helper
// Minimal helper for screenshot script

export const SHOT_SIZES = {
  cover: { w: 1080, h: 1080 },
  editor: { w: 1280, h: 720 },
  portrait: { w: 1080, h: 1350 },
  landscape: { w: 1920, h: 1080 },
};

export function parseShotQuery(query) {
  const params = new URLSearchParams(query);
  return {
    shot: params.get('shot') || 'cover',
    photo: params.get('photo') || '',
    caption: params.get('caption') || '',
    layout: params.get('layout') || 'hero',
    grade: params.get('grade') || 'vice-sunset',
    photos: params.get('photos')?.split(',') || [],
    w: parseInt(params.get('w') || '1080', 10),
    h: parseInt(params.get('h') || '1080', 10),
  };
}