import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react({
      // تحسين JSX
      jsxRuntime: 'automatic',
    }),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   manifest: {
    //     name: 'CyberPlan - تطبيق تعلم الأمن السيبراني',
    //     short_name: 'CyberPlan',
    //     description: 'تطبيق تعلم الأمن السيبراني الشخصي مع خطة 50 أسبوع - يعمل بدون إنترنت',
    //     start_url: '/',
    //     display: 'standalone',
    //     background_color: '#1a1a1a',
    //     theme_color: '#3b82f6',
    //     orientation: 'portrait-primary',
    //     scope: '/',
    //     lang: 'ar',
    //     dir: 'rtl',
    //     categories: ['education', 'productivity', 'utilities'],
    //     icons: [
    //       {
    //         src: '/icon-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //         purpose: 'maskable any'
    //       },
    //       {
    //         src: '/icon-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'maskable any'
    //       }
    //     ],
    //     shortcuts: [
    //       {
    //         name: 'لوحة التحكم',
    //         short_name: 'Dashboard',
    //         description: 'عرض لوحة التحكم الرئيسية',
    //         url: '/dashboard',
    //         icons: [
    //           {
    //             src: '/icon-96x96.png',
    //             sizes: '96x96'
    //           }
    //         ]
    //       },
    //       {
    //         name: 'المراحل',
    //         short_name: 'Phases',
    //         description: 'عرض مراحل التعلم',
    //         url: '/phases',
    //         icons: [
    //           {
    //             src: '/icon-96x96.png',
    //             sizes: '96x96'
    //           }
    //         ]
    //       }
    //     ]
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*$/,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'google-fonts-stylesheets',
    //         },
    //       },
    //       {
    //         urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*$/,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'google-fonts-webfonts',
    //         },
    //       },
    //     ],
    //     skipWaiting: true,
    //     clientsClaim: true,
    //   },
    //   devOptions: {
    //     enabled: true,
    //     type: 'module',
    //   },
    //         includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    // }),
  ],
  publicDir: 'public',
  build: {
    // تحسين الأداء
    target: 'esnext',
    minify: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        // تحسين chunk splitting
        manualChunks: {
          // فصل مكتبات React
          'react-vendor': ['react', 'react-dom'],
          // فصل مكتبات الرسم البياني
          'charts-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
          // فصل مكتبات التحرير
          'editor-vendor': ['@tiptap/react', '@tiptap/starter-kit'],
          // فصل مكتبات الحركة
          'motion-vendor': ['framer-motion'],
          // فصل مكتبات قاعدة البيانات
          'db-vendor': ['dexie'],
          // فصل مكتبات الترجمة
          'i18n-vendor': ['i18next', 'react-i18next'],
          // فصل مكتبات الأيقونات
          'icons-vendor': ['lucide-react'],
          // فصل مكتبات التوجيه
          'router-vendor': ['react-router-dom'],
          // فصل مكتبات الإشعارات
          'toast-vendor': ['react-hot-toast'],
        },
        // تحسين أسماء الملفات
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      // تحسين tree shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    // تحسين حجم الحزمة
    chunkSizeWarningLimit: 1000,
    // تمكين ضغط الملفات
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        toplevel: true,
      },
    },
    // تحسين CSS
    cssCodeSplit: true,
    cssMinify: true,
  },
  // تحسين الأداء في التطوير
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
      'dexie',
      'chart.js',
      'react-chartjs-2',
      'react-hot-toast',
      'i18next',
      'react-i18next',
    ],
    exclude: [
      // استبعاد الملفات الكبيرة من pre-bundling
      'jspdf',
      'html2canvas',
    ],
  },
  // تحسين سرعة التطوير
  server: {
    hmr: {
      overlay: false,
    },
    // تحسين caching
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  // تحسين الأداء العام
  esbuild: {
    target: 'esnext',
    supported: {
      'top-level-await': true,
    },
  },
  // تحسين CSS
  css: {
    devSourcemap: false,
  },
});