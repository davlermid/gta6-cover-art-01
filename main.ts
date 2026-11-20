import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function log(label: string, detail = '') {
  console.log(`[main] ${label}${detail ? ': ' + detail : ''}`);
}

log('Reading repo at', here);
log('Writing output to', out);

mkdirSync(out, { recursive: true });
log('Created output dir');

cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
log('Copied app/');

mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
  log('Copied screenshots/');
} else {
  log('No screenshots/ to copy');
}

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

writeFileSync(join(out, 'dossier.json'), buildDossier(out, caps));
log('Wrote dossier.json');