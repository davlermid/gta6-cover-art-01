import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SHOTS = [
  { name: '1-cover.jpg', query: '?shot=cover&photo=boulevard.jpg&caption=Sunset%20Heist&layout=quad-grid&grade=vice-sunset&photos=boulevard.jpg,pier.jpg', w: 1080, h: 1080 },
  { name: '2-editor.jpg', query: '?shot=editor&photo=boulevard.jpg&caption=Neon%20Shore&layout=quad-grid&grade=vice-sunset&photos=boulevard.jpg,pier.jpg', w: 1280, h: 720 },
  { name: '3-cover.jpg', query: '?shot=cover&photo=pier.jpg&caption=Pier%20Pressure&layout=duo-split&grade=teal-dusk&photos=boulevard.jpg,pier.jpg', w: 1024, h: 1280 },
  { name: '4-editor.jpg', query: '?shot=editor&photo=pier.jpg&caption=Boulevard%20Queen&layout=triptych&grade=neon-night&photos=boulevard.jpg,pier.jpg', w: 1280, h: 720 },
];

async function runServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', ['serve.ts', '--port', '8080'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('http://localhost:8080')) {
        resolve(proc);
      }
    });
    proc.stderr.on('data', (data) => {
      console.error('Server stderr:', data.toString());
    });
    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Server exited with code ${code}`));
    });

    setTimeout(() => reject(new Error('Server start timeout')), 10000);
  });
}

async function waitForApp(page) {
  await page.waitForSelector('#preview', { timeout: 10000 });
  await page.waitForFunction(() => {
    const canvas = document.getElementById('preview');
    return canvas && canvas.width > 0 && canvas.height > 0;
  }, { timeout: 10000 });
  // Wait for fonts and images to load
  await page.waitForTimeout(2000);
}

async function takeScreenshot(page, shot, index) {
  const url = `http://localhost:8080${shot.query}`;
  console.log(`[${index + 1}/4] Loading ${url}`);

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await waitForApp(page);

  // Check for console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    errors.push(err.message);
  });

  // For cover shots, trigger export and capture the result
  if (shot.query.includes('shot=cover')) {
    // The cover shot should show the exported cover - we render at export size
    await page.evaluate(async ({ w, h }) => {
      const canvas = document.getElementById('preview');
      canvas.width = w;
      canvas.height = h;
      // Trigger a re-render by dispatching a custom event
      window.dispatchEvent(new CustomEvent('resize'));
    }, { w: shot.w, h: shot.h });
    await page.waitForTimeout(1000);
  }

  // Screenshot the canvas area
  const canvas = await page.$('#preview');
  if (!canvas) throw new Error('Canvas not found');

  const screenshot = await canvas.screenshot({ type: 'jpeg', quality: 80 });

  // Check size constraints
  const maxBytes = 256 * 1024;
  const maxLongSide = 1280;
  const minShortSide = 480;

  if (screenshot.length > maxBytes) {
    console.warn(`  WARNING: ${shot.name} is ${screenshot.length} bytes (max ${maxBytes})`);
  }

  // Verify dimensions using sharp would be better, but let's check via page evaluation
  const dims = await page.evaluate(() => {
    const canvas = document.getElementById('preview');
    return { width: canvas.width, height: canvas.height };
  });

  const longSide = Math.max(dims.width, dims.height);
  const shortSide = Math.min(dims.width, dims.height);

  if (longSide > maxLongSide) {
    console.warn(`  WARNING: ${shot.name} long side ${longSide} > ${maxLongSide}`);
  }
  if (shortSide < minShortSide) {
    console.warn(`  WARNING: ${shot.name} short side ${shortSide} < ${minShortSide}`);
  }

  // Save screenshot
  const screenshotsDir = join(process.cwd(), 'screenshots');
  if (!existsSync(screenshotsDir)) mkdirSync(screenshotsDir, { recursive: true });
  writeFileSync(join(screenshotsDir, shot.name), screenshot);
  console.log(`  Saved ${shot.name} (${screenshot.length} bytes, ${dims.width}x${dims.height})`);

  if (errors.length > 0) {
    console.error('  CONSOLE ERRORS:', errors);
    throw new Error(`Console errors detected: ${errors.join('; ')}`);
  }

  console.log(`  OK - no console errors`);
}

async function main() {
  console.log('Starting server...');
  const server = await runServer();
  console.log('Server started');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console errors
  const allErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      allErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    allErrors.push(err.message);
  });

  try {
    for (let i = 0; i < SHOTS.length; i++) {
      await takeScreenshot(page, SHOTS[i], i);
    }
    console.log('\nAll screenshots captured successfully!');
  } finally {
    await browser.close();
    server.kill();
    console.log('Server stopped');
  }

  if (allErrors.length > 0) {
    console.error('\nCONSOLE ERRORS FOUND:');
    allErrors.forEach(e => console.error('  ', e));
    process.exit(1);
  }

  console.log('\nVerification passed - zero console errors');
}

main().catch(err => {
  console.error('FAILED:', err);
  process.exit(1);
});