// Neon Shore Cover Studio — Playwright verification script
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { statSync } from 'node:fs';
import { chromium } from 'playwright';

const here = fileURLToPath(new URL('.', import.meta.url));

// Start the server
const server = spawn('node', ['serve.ts'], { cwd: here, stdio: ['ignore', 'pipe', 'pipe'] });

let serverReady = false;
server.stdout.on('data', (data) => {
  const msg = data.toString();
  console.log('[server]', msg.trim());
  if (msg.includes('Neon Shore Cover Studio on http://localhost:')) {
    serverReady = true;
  }
});
server.stderr.on('data', (data) => console.error('[server err]', data.toString().trim()));

await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('Server start timeout')), 10000);
  const check = setInterval(() => {
    if (serverReady) {
      clearTimeout(timeout);
      clearInterval(check);
      resolve();
    }
  }, 100);
});

console.log('Server started, waiting 2s...');
await new Promise((r) => setTimeout(r, 2000));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Capture console errors
const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text());
  }
});

page.on('pageerror', (err) => {
  consoleErrors.push(err.message);
});

const baseUrl = 'http://localhost:8080';

try {
  // Load the app
  console.log('Loading app...');
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#preview-canvas', { timeout: 10000 });
  console.log('App loaded');

  // Wait for samples to load
  await page.waitForTimeout(2000);

  // SHOT 1: 1-cover.jpg - exported cover (portrait 1024x1280 approx)
  console.log('Taking shot 1-cover.jpg...');
  await page.evaluate(() => {
    const btn = document.querySelector('[data-sample="samples/pier.jpg"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(1500);

  await page.evaluate(() => {
    document.getElementById('caption-input').value = 'Sunset Heist';
    document.getElementById('caption-input').dispatchEvent(new Event('input'));
    document.getElementById('subtitle-input').value = 'Neon Shore Cover Studio';
    document.getElementById('subtitle-input').dispatchEvent(new Event('input'));
  });
  await page.waitForTimeout(500);

  // Export 1080x1350 (portrait)
  await page.evaluate(() => {
    const btn = document.querySelector('[data-width="1080"][data-height="1350"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: resolve(here, 'screenshots/1-cover.jpg'), type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 1024, height: 1280 } });
  console.log('Shot 1 done');

  // SHOT 2: 2-editor.jpg - editor with photo loaded (1280x720)
  console.log('Taking shot 2-editor.jpg...');
  await page.evaluate(() => {
    const btn = document.querySelector('[data-sample="samples/boulevard.jpg"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(1500);

  await page.evaluate(() => {
    document.getElementById('caption-input').value = 'Boulevard Queen';
    document.getElementById('caption-input').dispatchEvent(new Event('input'));
    document.getElementById('subtitle-input').value = 'Vice City Vibes';
    document.getElementById('subtitle-input').dispatchEvent(new Event('input'));
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: resolve(here, 'screenshots/2-editor.jpg'), type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 1280, height: 720 } });
  console.log('Shot 2 done');

  // SHOT 3: 3-cover.jpg - another exported cover (landscape 1280x720)
  console.log('Taking shot 3-cover.jpg...');
  await page.evaluate(() => {
    const btn = document.querySelector('[data-sample="samples/boulevard.jpg"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(1500);

  await page.evaluate(() => {
    document.getElementById('layout-select').value = '3'; // Quad Grid
    document.getElementById('layout-select').dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    document.getElementById('grade-select').value = '4'; // Magenta Rain
    document.getElementById('grade-select').dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(500);

  // Export 1920x1080 (landscape)
  await page.evaluate(() => {
    const btn = document.querySelector('[data-width="1920"][data-height="1080"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: resolve(here, 'screenshots/3-cover.jpg'), type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 1280, height: 720 } });
  console.log('Shot 3 done');

  // SHOT 4: 4-editor.jpg - editor with different layout/grade (1280x720)
  console.log('Taking shot 4-editor.jpg...');
  await page.evaluate(() => {
    const btn = document.querySelector('[data-sample="samples/pier.jpg"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(1500);

  await page.evaluate(() => {
    document.getElementById('layout-select').value = '1'; // Duo Split
    document.getElementById('layout-select').dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    document.getElementById('grade-select').value = '2'; // Teal Dusk
    document.getElementById('grade-select').dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    document.getElementById('caption-input').value = 'Neon Shore';
    document.getElementById('caption-input').dispatchEvent(new Event('input'));
    document.getElementById('subtitle-input').value = 'Midnight Run';
    document.getElementById('subtitle-input').dispatchEvent(new Event('input'));
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: resolve(here, 'screenshots/4-editor.jpg'), type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 1280, height: 720 } });
  console.log('Shot 4 done');

  // Verify console errors
  await browser.close();
  server.kill();

  console.log('\n=== Console Errors ===');
  if (consoleErrors.length === 0) {
    console.log('NONE - PASS');
  } else {
    consoleErrors.forEach((e) => console.log('ERROR:', e));
    throw new Error(`Found ${consoleErrors.length} console error(s)`);
  }

  // Check file sizes
  const shots = ['1-cover.jpg', '2-editor.jpg', '3-cover.jpg', '4-editor.jpg'];
  for (const shot of shots) {
    const path = resolve(here, 'screenshots', shot);
    const size = statSync(path).size;
    const kb = (size / 1024).toFixed(1);
    console.log(`${shot}: ${kb} KiB`);
    if (size > 262144) {
      throw new Error(`${shot} exceeds 256 KiB limit`);
    }
  }

  console.log('\n✅ All checks passed!');
  process.exit(0);

} catch (err) {
  console.error('\n❌ Verification failed:', err.message);
  await browser.close().catch(() => {});
  server.kill();
  process.exit(1);
}