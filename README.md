# Mark Your Picture

A fast, private, 100% client-side watermarking tool. Add text or logo watermarks to your images — everything runs in your browser, nothing is ever uploaded.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-GitHub%20Pages-6c63ff)](https://el-j.github.io/mark-your-picture/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

## Features

- **Text watermark** — custom font, size, style, color
- **Image / logo watermark** — upload your own logo
- **Single image** — process one image at a time
- **Batch (ZIP)** — process multiple images and download as a ZIP
- **Dark / Light mode** — automatic + manual toggle
- **Offline PWA** — installable, works without internet
- **100% client-side** — your images never leave your device

## Screenshots

<!-- Screenshots -->

## Getting Started

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
```

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [React](https://react.dev) | UI framework |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [JSZip](https://stuk.github.io/jszip/) | Batch ZIP export |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app) | PWA support |

## i18n

Supported languages: **English** (`en`), **German** (`de`)

### Adding a new language

1. Copy `src/i18n/locales/en.ts` to e.g. `src/i18n/locales/fr.ts`
2. Translate all string values (keep the keys unchanged)
3. Export as `export const fr: Translations = { ... }`
4. Register in `src/i18n/index.tsx`:
   - Add `'fr'` to the `Lang` type
   - Import and add `fr` to the `locales` map
   - Add `'fr'` to the `LangSwitcher` array in `Header.tsx`

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on reporting bugs, suggesting features, and submitting pull requests.

## License

[MIT](./LICENSE) © 2026 el-j and contributors
