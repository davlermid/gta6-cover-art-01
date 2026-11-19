# Neon Shore Cover Studio

A GTA 6-style cover art maker web app for the make.fun gta6-cover-art-01 competition. Create neon-soaked, Vice City-inspired cover art with multiple layouts, color grades, and custom lettering — all running offline in your browser.

## Live Badges

![make.fun badge](https://make.fun/badge/gta6-cover-art-01.svg)
![rank badge](https://make.fun/badge/gta6-cover-art-01/davlermid/gta6-cover-art-01/rank.svg)
![reward badge](https://make.fun/badge/gta6-cover-art-01/davlermid/gta6-cover-art-01/reward.svg)

[View on make.fun](https://make.fun)

## Features

- **6 Multi-panel Layouts**: Single Hero, Duo Split, Triptych, Quad Grid, Diagonal Slash, Filmstrip
- **6 Color Grades**: Vice Sunset, Neon Night, Teal Dusk, Golden Hour, Magenta Rain, Mono Noir
- **4 OFL Fonts**: Archivo Black (default), Anton, Bebas Neue, Pacifico
- **Per-panel crop/zoom/pan** with drag and wheel controls
- **Bold lettering** with thick black outline, white fill, and neon-glow subtitle
- **PNG Export** at 3 sizes: Square (1080×1080), Portrait (1080×1350), Landscape (1920×1080)
- **Built-in sample photos** + drag-and-drop your own images
- **Randomize button** for instant inspiration
- **Keyboard shortcuts**: 1-6 for layouts, arrows for layout/grade navigation
- **Fully offline** — no network requests, all assets local

## Quick Start

```bash
# Serve locally
node serve.ts

# Open http://localhost:8080
```

Or open `app/index.html` directly in a browser (some features require a local server due to CORS for fonts).

## Build for Submission

```bash
# Output to ./out
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

# The dossier.json and app/ will be in ./out
```

## Project Structure

```
├── app/
│   ├── index.html          # Main editor page
│   ├── style.css           # Neon noir theme
│   ├── fonts/              # 4 OFL fonts (Archivo Black, Anton, Bebas Neue, Pacifico)
│   ├── samples/            # Sample photos (boulevard.jpg, pier.jpg)
│   └── src/
│       ├── main.js         # UI wiring & event handlers
│       ├── state.js        # App state management
│       ├── layouts.js      # 6 panel layouts (normalized coords)
│       ├── grades.js       # 6 color grade shaders
│       ├── render.js       # Canvas renderer & PNG export
│       └── shots.js        # Screenshot helper
├── screenshots/            # 4 JPEG screenshots for judging
├── main.ts                 # Build script (copies app/ + writes dossier.json)
├── serve.ts                # Dev server (static files on :8080)
├── shots.json              # Screenshot definitions
├── verify.mjs              # Playwright verification script
└── vendor/makefun-app.ts   # make.fun dossier library
```

## Screenshots

The `screenshots/` folder contains 4 renders captured by `verify.mjs`:
- `1-cover.jpg` — Exported cover (portrait)
- `2-editor.jpg` — Editor with photo loaded
- `3-cover.jpg` — Another exported cover (landscape)
- `4-editor.jpg` — Editor with different layout/grade

## Tech Notes

- **No frameworks** — vanilla ES modules, Canvas 2D API
- **Offline-first** — all fonts, images, and code bundled under `app/`
- **OFL fonts only** — downloaded from google/fonts, no proprietary typefaces
- **No Rockstar IP** — original neon aesthetic inspired by GTA 6 marketing style
- **ESM only** — runs in modern browsers without transpilation

## License

MIT — see LICENSE file.