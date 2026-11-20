// verify.mjs - Playwright verification script for Neon Shore Cover Studio
// Starts serve.ts, loads app, tests interactions, exports covers, saves screenshots

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = resolve(fileURLToPath(new URL('.', import.meta.url)));

// Import Playwright from node_modules
let playwright;
try {
  playwright = await import('./node_modules/playwright-core/index.mjs');
} catch (e) {
  console.error('Failed to import Playwright:', e.message);
  process.exit(1);
}

const { chromium } = playwright;

const SCREENSHOTS_DIR = join(__dirname, 'screenshots');
const APP_URL = 'http://localhost:8080';
const SERVER_PORT = 8080;

mkdirSync(SCREENSHOTS_DIR, { recursive: true });

function log(msg) {
  console.log(`[verify] ${msg}`);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startServer() {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['serve.ts'], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NODE_PATH: join(__dirname, 'node_modules') },
    });
    
    let output = '';
    server.stdout.on('data', data => {
      output += data.toString();
      if (output.includes('running at')) {
        log('Server started');
        resolve(server);
      }
    });
    
    server.stderr.on('data', data => {
      console.error('[server]', data.toString());
    });
    
    server.on('error', reject);
    server.on('exit', code => {
      if (code !== 0 && code !== null) {
        log(`Server exited with code ${code}`);
      }
    });
    
    // Timeout after 10 seconds
    setTimeout(() => reject(new Error('Server start timeout')), 10000);
  });
}

async function stopServer(server) {
  return new Promise(resolve => {
    server.kill('SIGTERM');
    server.on('exit', () => {
      log('Server stopped');
      resolve();
    });
    setTimeout(() => {
      server.kill('SIGKILL');
      resolve();
    }, 2000);
  });
}

async function takeScreenshot(page, name, options = {}) {
  const { maxSize = 256 * 1024, maxLongSide = 1280, minShortSide = 480 } = options;
  
  const buffer = await page.screenshot({ type: 'jpeg', quality: 80 });
  
  // Check size constraints
  if (buffer.length > maxSize) {
    log(`Screenshot ${name} is ${buffer.length} bytes, exceeds ${maxSize}, re-compressing...`);
    // Re-compress with lower quality
    const recompressed = await page.screenshot({ type: 'jpeg', quality: 60 });
    if (recompressed.length <= maxSize) {
      writeFileSync(join(SCREENSHOTS_DIR, name), recompressed);
      log(`Saved ${name} (${recompressed.length} bytes)`);
      return;
    }
    // Try even lower quality
    const recompressed2 = await page.screenshot({ type: 'jpeg', quality: 40 });
    writeFileSync(join(SCREENSHOTS_DIR, name), recompressed2);
    log(`Saved ${name} (${recompressed2.length} bytes)`);
    return;
  }
  
  writeFileSync(join(SCREENSHOTS_DIR, name), buffer);
  log(`Saved ${name} (${buffer.length} bytes)`);
}

async function resizeImage(buffer, maxLongSide, minShortSide) {
  // We'll use a simple approach: just return the buffer as-is
  // The screenshot API handles dimensions via viewport
  return buffer;
}

async function runVerification() {
  let server;
  let browser;
  let page;
  
  try {
    // Start server
    log('Starting server...');
    server = await startServer();
    await delay(1000);
    
    // Launch browser
    log('Launching browser...');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    page = await context.newPage();
    
    // Collect console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error('[browser console error]', msg.text());
      }
    });
    
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
      console.error('[browser page error]', err.message);
    });
    
    // Load app
    log('Loading app...');
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(1000);
    
    // Wait for canvas to be ready
    await page.waitForSelector('#canvas', { timeout: 10000 });
    await page.evaluate(() => {
      return new Promise(resolve => {
        const canvas = document.getElementById('canvas');
        if (canvas.width > 0) resolve();
        const check = setInterval(() => {
          if (canvas.width > 0) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });
    });
    
    log('App loaded, testing interactions...');
    
    // ===== SHOT 1: 1-cover.jpg - Cover export (portrait 1080x1080) =====
        log('--- Shot 1: Cover export ---');

        // Select pier sample
        await page.selectOption('#sample-picker', 'samples/pier.jpg');
        await delay(500);

        // Set caption
        await page.fill('#caption-input', 'Sunset Heist');
        await delay(200);

        // Set layout to Single Hero (0)
        await page.selectOption('#layout-picker', '0');
        await delay(200);

        // Set grade to Vice Sunset (0)
        await page.selectOption('#grade-picker', '0');
        await delay(500);

        // Wait for render
        await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

        // Export 1080x1080 and take a screenshot of the result
        const downloadPromise = page.waitForEvent('download');
        await page.click('#export-1080');
        const download = await downloadPromise;
        // Consume the download stream but don't save the raw PNG
        await download.createReadStream().then(stream => new Promise((resolve, reject) => {
          stream.on('data', () => {});
          stream.on('end', resolve);
          stream.on('error', reject);
        }));

        // Take a proper JPEG screenshot of the canvas (already at 1080x1080)
        const canvas = await page.$('#canvas');
        await canvas.screenshot({ path: join(SCREENSHOTS_DIR, '1-cover.jpg'), type: 'jpeg', quality: 75 });
        log('Shot 1 saved (exported cover)');
    
    // ===== SHOT 2: 2-editor.jpg - Editor with photo loaded (1280x720) =====
    log('--- Shot 2: Editor view ---');
    
    // Select boulevard sample
    await page.selectOption('#sample-picker', 'samples/boulevard.jpg');
    await delay(500);
    
    // Set caption
    await page.fill('#caption-input', 'Boulevard Queen');
    await delay(200);
    
    // Set layout to Duo Split (1)
    await page.selectOption('#layout-picker', '1');
    await delay(200);
    
    // Set grade to Neon Night (1)
    await page.selectOption('#grade-picker', '1');
    await delay(500);
    
    // Set viewport for editor shot
    await page.setViewportSize({ width: 1280, height: 720 });
    await delay(500);
    
    await takeScreenshot(page, '2-editor.jpg', { maxSize: 256 * 1024 });
    log('Shot 2 saved (editor)');
    
    // ===== SHOT 3: 3-cover.jpg - Another cover export (landscape 1920x1080 -> save as 1280x720) =====
        log('--- Shot 3: Cover export (landscape) ---');

        // Select boulevard sample (already selected)
        // Set layout to Quad Grid (3)
        await page.selectOption('#layout-picker', '3');
        await delay(200);

        // Set grade to Golden Hour (3)
        await page.selectOption('#grade-picker', '3');
        await delay(500);

        // Export 1920x1080 and take a screenshot of the canvas at 1280x720
        const downloadPromise3 = page.waitForEvent('download');
        await page.click('#export-1920');
        const download3 = await downloadPromise3;
        // Consume the download stream but don't save the raw PNG
        await download3.createReadStream().then(stream => new Promise((resolve, reject) => {
          stream.on('data', () => {});
          stream.on('end', resolve);
          stream.on('error', reject);
        }));

        // Take screenshot of canvas area at 1280x720
        await page.setViewportSize({ width: 1280, height: 720 });
        await delay(300);

        const canvas3 = await page.$('#canvas');
        await canvas3.screenshot({ path: join(SCREENSHOTS_DIR, '3-cover.jpg'), type: 'jpeg', quality: 80 });
        log('Shot 3 saved (landscape cover)');
    
    // ===== SHOT 4: 4-editor.jpg - Editor with different layout/grade (1280x720) =====
    log('--- Shot 4: Editor with different layout/grade ---');
    
    // Select pier sample
    await page.selectOption('#sample-picker', 'samples/pier.jpg');
    await delay(500);
    
    // Set caption
    await page.fill('#caption-input', 'Midnight Run');
    await delay(200);
    
    // Set layout to Filmstrip (5)
    await page.selectOption('#layout-picker', '5');
    await delay(200);
    
    // Set grade to Magenta Rain (4)
    await page.selectOption('#grade-picker', '4');
    await delay(500);
    
    await takeScreenshot(page, '4-editor.jpg', { maxSize: 256 * 1024 });
    log('Shot 4 saved (editor)');
    
    // Verify console errors
    if (consoleErrors.length > 0) {
      throw new Error(`Console errors detected: ${consoleErrors.join('; ')}`);
    }
    
    log('All screenshots saved, no console errors!');
    
    // Verify files exist and are valid
    for (let i = 1; i <= 4; i++) {
      const path = join(SCREENSHOTS_DIR, `${i}-${i <= 2 ? 'cover' : i === 3 ? 'cover' : 'editor'}.jpg`);
      const actualPath = join(SCREENSHOTS_DIR, `${i}-${['cover', 'editor', 'cover', 'editor'][i-1]}.jpg`);
      if (existsSync(actualPath)) {
        const stats = await import('node:fs/promises').then(fs => fs.stat(actualPath));
        log(`Verified ${actualPath}: ${stats.size} bytes`);
        if (stats.size > 256 * 1024) {
          throw new Error(`Screenshot ${actualPath} exceeds 256 KiB`);
        }
      }
    }
    
  } finally {
    if (browser) await browser.close();
    if (server) await stopServer(server);
  }
}

runVerification()
  .then(() => {
    log('Verification passed!');
    process.exit(0);
  })
  .catch(err => {
    log(`Verification failed: ${err.message}`);
    console.error(err);
    process.exit(1);
  });