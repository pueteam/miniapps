import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import appConfig from './app.config.json';

function getHomeBase() {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || process.env.VITE_REPO_NAME || '';
  return repo ? `/${repo}/` : '/';
}

const base = getHomeBase();
const escapedBase = base.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');

export default defineConfig({
  base,
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.png', 'pwa-512.png', 'pwa-maskable-512.png'],
      devOptions: {
        enabled: true,
      },
      manifest: {
        id: base,
        name: appConfig.title,
        short_name: appConfig.title,
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: appConfig.backgroundColor,
        theme_color: appConfig.themeColor,
        description: appConfig.description,
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        screenshots: [
          { src: 'screenshots/desktop.png', sizes: '1280x720', type: 'image/png', form_factor: 'wide' },
          { src: 'screenshots/mobile.png', sizes: '390x844', type: 'image/png' }
        ],
        categories: ['utilities'],
        lang: 'es'
      },
      // Evitar que el service worker del launcher capture navegación a subrutas de otras miniapps
      // y devuelva el index del launcher. Añadimos una denylist para rutas como `/<repo>/<app>/...`.
      workbox: {
        navigateFallbackDenylist: [new RegExp(`^${escapedBase}[^/]+/`)]
      }
    })
  ]
});
