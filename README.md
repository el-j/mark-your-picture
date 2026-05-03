# Mark Your Picture

A clean, client-side watermark tool — 100% runs in the browser, nothing is uploaded.

## Features

- **Text & image/logo watermarks** — font, size, style, color, opacity, rotation, position, margin
- **Single image** preview with live updates and PNG download
- **Batch processing** — apply watermarks to multiple images and download as ZIP
- **Dark / Light mode** — follows system preference, toggle in header
- **Mobile-first** responsive layout

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # production build → dist/
npm run preview  # preview production build
```

## Tech Stack

- [Vite](https://vitejs.dev/) — build tool
- TypeScript (strict)
- Vanilla DOM / Canvas API
- [JSZip](https://stuk.github.io/jszip/) — ZIP generation for batch download
