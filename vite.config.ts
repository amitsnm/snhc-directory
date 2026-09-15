import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['snhc-mark.png', 'snhc-logo.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Sant Nirankari Health City Contact Center',
        short_name: 'SNHC Contact',
        description: 'Sant Nirankari Health City contact center — emergency codes, directory, tariff, doctors, and helpdesk',
        theme_color: '#004239',
        background_color: '#000000',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/snhc-mark.png',
            sizes: '903x1024',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-192.png',
            sizes: '903x1024',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '903x1024',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Tariff Master JSON is large and loaded on demand — do not fail the build.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/api/') || url.hostname.includes('ldap'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'directory-api',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/data/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'tariff-data',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
