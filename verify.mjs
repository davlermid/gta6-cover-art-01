// Neon Shore Cover Studio - Verification Script
// Playwright test: starts server, loads app, switches layout/grade, exports cover, asserts zero console errors

import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, existsSync } from 'node:fs';

const here = fileURLToPath(new URL('.', import.meta.url));

// Start the static server
const server = spawn('node', ['serve.ts'], {
  cwd: here,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverReady = false;
server.stdout.on('data', (data) => {
  console.log('[server]', data.toString().trim());
  if (data.toString().includes('app/ is on')) serverReady = true;
});
server.stderr.on('data', (data) => console.error('[server err]', data.toString().trim()));

await new Promise((resolve) => setTimeout(resolve, 1000));

// Import Playwright
const { chromium } = await import('playwright-core');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text());
    console.error('[browser console error]', msg.text());
  }
});

page.on('pageerror', (err) => {
  consoleErrors.push(err.message);
  console.error('[browser page error]', err.message);
});

const screenshotsDir = resolve(here, 'screenshots');
mkdirSync(screenshotsDir, { recursive: true });

async function screenshot(name, options = {}) {
  const path = resolve(screenshotsDir, name);
  await page.screenshot({ path, type: 'jpeg', quality: 80, ...options });
  console.log(`Saved ${name}`);
}

try {
  // 1. Load editor with sample photo
  console.log('Loading editor with pier.jpg...');
  await page.goto('http://localhost:8080/?shot=editor&photo=pier&caption=Neon%20Shore&layout=0&grade=0', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForSelector('#main-canvas', { timeout: 10000 });
  await page.waitForTimeout(1000);
  await screenshot('2-editor.jpg', { clip: { x: 0, y: 0, width: 1280, height: 720 } });

  // 2. Export a cover (portrait)
  console.log('Exporting cover (portrait)...');
  await page.goto('http://localhost:8080/?shot=cover&photo=pier&caption=Neon%20Shore&layout=0&grade=0', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForSelector('#main-canvas', { timeout: 10000 });
  await page.waitForTimeout(1000);
  await screenshot('1-cover.jpg', { clip: { x: 0, y: 0, width: 1024, height: 1280 } });

  // 3. Switch layout and grade, export another cover (landscape)
  console.log('Switching layout/grade, exporting landscape cover...');
  await page.goto('http://localhost:8080/?shot=cover&photo=boulevard&caption=Midnight%20Run&layout=3&grade=2', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForSelector('#main-canvas', { timeout: 10000 });
  await page.waitForTimeout(1000);
  await screenshot('3-cover.jpg', { clip: { x: 0, y: 0, width: 1280, height: 720 } });

  // 4. Editor with different layout/grade
  console.log('Loading editor with different layout/grade...');
  await page.goto('http://localhost:8080/?shot=editor&photo=pier&caption=Pier%20Pressure&layout=5&grade=4', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForSelector('#main-canvas', { timeout: 10000 });
  await page.waitForTimeout(1000);
  await screenshot('4-editor.jpg', { clip: { x: 0, y: 0, width: 1280, height: 720 } });

  // Verify screenshots exist and are under size limits
  const fs = await import('node:fs');
  for (const name of ['1-cover.jpg', '2-editor.jpg', '3-cover.jpg', '4-editor.jpg']) {
    const path = resolve(screenshotsDir, name);
    if (!existsSync(path)) throw new Error(`Missing screenshot: ${name}`);
    const stats = fs.statSync(path);
    if (stats.size > 262144) throw new Error(`${name} exceeds 256 KiB (${stats.size} bytes)`);
    console.log(`${name}: ${stats.size} bytes OK`);
  }

  if (consoleErrors.length > 0) {
    throw new Error(`Console errors detected: ${consoleErrors.join('; ')}`);
  }

  console.log('\n✅ All checks passed!');
  console.log('- 4 screenshots saved');
  console.log('- Zero console errors');
  console.log('- All screenshots under 256 KiB');

} catch (err) {
  console.error('\n❌ Verification failed:', err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.kill();
}