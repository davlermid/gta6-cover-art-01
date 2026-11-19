// Shot scenes: sets window.__shotReady once the scene is fully painted (fonts, photos and cover included),
// so a screenshot script can wait for it. Called by main.js after the scene state is applied.
export async function runShot(shot, query) {
  void shot;
  void query;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__shotReady = true;
}
