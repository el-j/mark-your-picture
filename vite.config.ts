import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      // Manifest is served from public/manifest.webmanifest (Rolldown-safe approach)
      manifest: false,
      injectRegister: 'script',
      includeAssets: ['favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png', 'icons/*.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],
        runtimeCaching: [],
      },
    }),
  ],
});
