# Neon Shore Cover Studio

A GTA 6-style cover art maker web app. Create stunning neon-drenched cover art with multi-panel layouts, cinematic color grades, and bold typography — all running offline in your browser.

![make.fun badge](https://make.fun/badge/gta6-cover-art-01.svg)
![rank badge](https://make.fun/badge/gta6-cover-art-01/davlermid/gta6-cover-art-01/rank.svg)
![reward badge](https://make.fun/badge/gta6-cover-art-01/davlermid/gta6-cover-art-01/reward.svg)

[View on make.fun](https://make.fun)

## Features

- **6 Multi-panel layouts**: Single Hero, Duo Split, Triptych, Quad Grid, Diagonal Slash, Filmstrip
- **6 Cinematic color grades**: Vice Sunset, Neon Night, Teal Dusk, Golden Hour, Magenta Rain, Mono Noir
- **4 OFL fonts**: Archivo Black (default), Anton, Bebas Neue, Pacifico
- **Per-panel crop/zoom/pan**: Drag to pan, scroll/wheel to zoom each panel independently
- **GTA-style lettering**: White fill with thick black outline, neon-glow subtitle
- **PNG export**: 1080×1080 (square), 1080×1350 (portrait), 1920×1080 (landscape)
- **Built-in samples**: Boulevard and Pier photos included
- **Fully offline**: No network requests, runs from static files

## Running Locally

```bash
# Serve the app
node serve.ts
# Open http://localhost:8080
```

Or open `app/index.html` directly in a browser (some features may be limited by CORS).

## Building for Submission

```bash
# Copies app/ and screenshots/ to output dir and writes dossier.json
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Screenshots

The `shots.json` defines four automated shots for the make.fun submission:
1. **1-cover.jpg** — Cover export (1080×1080) with Pier photo, Vice Sunset grade
2. **2-editor.jpg** — Editor view (1280×720) with Boulevard photo, Neon Night grade
3. **3-cover.jpg** — Cover export (1080×1080) with Boulevard photo, Golden Hour grade
4. **4-editor.jpg** — Editor view (1280×720) with Pier photo, Magenta Rain grade

## Keyboard Shortcuts

- `R` — Randomize everything
- `1` — Export 1080×1080
- `2` — Export 1080×1350
- `3` — Export 1920×1080
- `←` / `→` — Switch active panel (multi-panel layouts)
- `S` — Copy shot URL to clipboard (share current state)

## Fonts

All fonts are SIL OFL licensed, downloaded from Google Fonts:
- Archivo Black
- Anton
- Bebas Neue
- Pacifico

## License

MIT — see LICENSE file.