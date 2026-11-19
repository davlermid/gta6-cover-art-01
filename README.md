# Neon Shore Cover Studio

A GTA 6-style cover art maker web app. Create stunning cover art with multi-panel layouts, cinematic color grades, and neon-glow lettering.

![Badge](https://make.fun/badge/gta6-cover-art-01.svg)
![Rank](https://make.fun/badge/gta6-cover-art-01/davlermid/gta6-cover-art-01/rank.svg)
![Reward](https://make.fun/badge/gta6-cover-art-01/davlermid/gta6-cover-art-01/reward.svg)

[View on make.fun](https://make.fun)

## Features

- **6 Multi-panel Layouts**: Single Hero, Duo Split, Triptych, Quad Grid, Diagonal Slash, Filmstrip
- **6 Cinematic Color Grades**: Vice Sunset, Neon Night, Teal Dusk, Golden Hour, Magenta Rain, Mono Noir
- **4 OFL Fonts**: Archivo Black (default), Anton, Bebas Neue, Pacifico
- **Per-panel Crop/Zoom/Pan**: Drag to pan, wheel/slider to zoom
- **Caption Lettering**: White fill with thick black outline, neon-glow subtitle
- **Export Sizes**: 1080×1080 (square), 1080×1350 (portrait), 1920×1080 (landscape)
- **Works Offline**: No network requests, photos read locally

## Running Locally

```bash
# Serve the app
node serve.ts

# Open http://localhost:8080 in your browser
```

## Building the Dossier

```bash
# Output to ./out
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

# Output to /output (grader default)
node main.ts
```

## Screenshots

Screenshots are in `screenshots/`:
- `1-cover.jpg` - Exported cover (square 1080×1080)
- `2-editor.jpg` - Editor with photo loaded (1080×1080)
- `3-cover.jpg` - Another exported cover (portrait 1024×1280)
- `4-editor.jpg` - Editor with different layout/grade (1080×1080)

## License

MIT - see LICENSE file.