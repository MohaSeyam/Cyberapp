import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CyberPlan - تطبيق تعلم الأمن السيبراني',
        short_name: 'CyberPlan',
        description: 'تطبيق تعلم الأمن السيبراني الشخصي مع خطة 50 أسبوع - يعمل بدون إنترنت',
        start_url: '/',
        display: 'standalone',
        background_color: '#1a1a1a',
        theme_color: '#3b82f6',
        orientation: 'portrait-primary',
        scope: '/',
        lang: 'ar',
        dir: 'rtl',
        categories: ['education', 'productivity', 'utilities'],
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ],
        shortcuts: [
          {
            name: 'لوحة التحكم',
            short_name: 'Dashboard',
            description: 'عرض لوحة التحكم الرئيسية',
            url: '/dashboard',
            icons: [
              {
                src: '/icon-96x96.png',
                sizes: '96x96'
              }
            ]
          },
          {
            name: 'المراحل',
            short_name: 'Phases',
            description: 'عرض مراحل التعلم',
            url: '/phases',
            icons: [
              {
                src: '/icon-96x96.png',
                sizes: '96x96'
              }
            ]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
            },
          },
        ],
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    }),
  ],
  publicDir: 'public',
});