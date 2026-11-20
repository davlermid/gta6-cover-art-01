# Neon Shore Cover Studio

A GTA 6–style cover art maker that runs entirely in the browser. Load a photo (or use the built-in samples), pick a multi-panel layout, choose a color grade, add a bold caption with a neon-glow subtitle, and export high-resolution PNGs.

![gta6-cover-art-01 badge](https://make.fun/badge/gta6-cover-art-01.svg)
![rank badge](https://make.fun/badge/gta6-cover-art-01/davlermid/gta6-cover-art-01/rank.svg)
![reward badge](https://make.fun/badge/gta6-cover-art-01/davlermid/gta6-cover-art-01/reward.svg)

[View on make.fun](https://make.fun)

## Features

- **6 layouts**: Hero, Duo Split, Triptych, Quad Grid, Diagonal Slash, Filmstrip
- **6 color grades**: Vice Sunset, Neon Night, Teal Dusk, Golden Hour, Magenta Rain, Mono Noir
- **4 OFL fonts**: Archivo Black (default), Anton, Bebas Neue, Pacifico
- **Per-panel crop/zoom/pan** with drag and wheel controls
- **Subtle panel borders** on multi-panel layouts for visual clarity
- **Export sizes**: 1080×1080 (square), 1080×1350 (portrait), 1920×1080 (landscape)
- **Works offline** — no network requests, photos stay local
- **Randomize** button for instant inspiration
- **Keyboard shortcuts**: R = randomize, 1–6 = layout, ↑/↓ = zoom, Ctrl+S = quick export

## Run locally

```bash
# From the repo root
node serve.ts
# Open http://localhost:8080
```

Or build the dossier for submission:

```bash
MAKEFUN_OUTPUT_DIR=out node main.ts
# Output written to out/app/, out/screenshots/, out/dossier.json
```

## Project structure

```
app/
  index.html        # Editor UI
  style.css         # Styles
  src/
    main.js         # UI wiring
    state.js        # App state
    layouts.js      # 6 panel layouts
    grades.js       # 6 color grades
    render.js       # Canvas renderer & PNG export
    shots.js        # Shot URL helper
  fonts/            # OFL fonts (Archivo Black, Anton, Bebas Neue, Pacifico)
  samples/          # Built-in sample photos
screenshots/        # 4 preview renders (cover + editor shots)
main.ts             # Dossier builder
serve.ts            # Static file server
vendor/makefun-app.ts  # make.fun library (byte-identical copy)
```

## License

MIT — see LICENSE. Fonts are SIL Open Font License.