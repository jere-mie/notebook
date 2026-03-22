import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192x192.png', 'icons/icon-512x512.png'],
      manifest: {
        name: 'notebook.',
        short_name: 'notebook',
        description: 'A beautiful, minimal notes app with code highlighting.',
        theme_color: '#C4612D',
        background_color: '#1A1714',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        // No precaching — we don't want to serve anything cache-first from the app shell.
        // Vite already content-hashes JS/CSS filenames, so the real staleness risk is index.html.
        globPatterns: [],
        // Disable vite-plugin-pwa's auto-injected NavigationRoute (which tries to serve
        // index.html from precache — broken since we have no precache). The NetworkFirst
        // handler below covers navigation requests instead.
        navigateFallback: '',
        runtimeCaching: [
          {
            // Google Fonts stylesheets — truly immutable, safe to cache forever
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Google Fonts files — immutable
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Everything else (HTML, JS, CSS, icons, etc.):
            // Always try the network first. Only serve from cache if the network
            // is unreachable (offline fallback). networkTimeoutSeconds gives a
            // 5-second budget before falling back when connection is just slow.
            urlPattern: /.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  base: '/',
})
