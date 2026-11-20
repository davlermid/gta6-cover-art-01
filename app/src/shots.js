// Neon Shore Cover Studio — shots helper (used by screenshot script)
export const shotQueries = {
  cover: '?shot=cover',
  editor: '?shot=editor',
};

export function buildShotUrl(base, shot, params = {}) {
  const url = new URL(base);
  url.search = shotQueries[shot] || '';
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}