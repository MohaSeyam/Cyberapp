import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Performance optimization: Enhanced Vite config
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  
  // Performance optimizations
  build: {
    // Enable source maps for debugging
    sourcemap: false,
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    
    // Code splitting optimization
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'utils-vendor': ['react-hot-toast', 'idb'],
          'charts-vendor': ['recharts'],
          'pdf-vendor': ['jspdf', 'html2canvas'],
          'csv-vendor': ['papaparse'],
          
          // Feature chunks
          'progress': [
            './src/pages/ProgressPage.tsx',
            './src/components/progress/EnhancedOverviewTab.tsx',
            './src/components/progress/EnhancedAnalyticsTab.tsx',
            './src/components/progress/EnhancedSuggestionsTab.tsx',
            './src/components/progress/EnhancedAchievementsTab.tsx',
            './src/components/progress/EnhancedSkillsTab.tsx',
            './src/components/progress/EnhancedReportsTab.tsx',
            './src/components/progress/ProgressAnalytics.tsx',
            './src/components/progress/ProgressOverview.tsx',
            './src/components/progress/OverallProgressCard.tsx',
            './src/hooks/useProgressStats.ts'
          ],
          'phases': [
            './src/pages/PhasesPage.tsx',
            './src/pages/WeeksPage.tsx',
            './src/pages/DayPage.tsx'
          ],
          'notes': [
            './src/pages/NotesPage.tsx',
            './src/pages/NoteViewPage.tsx',
            './src/pages/NoteEditPage.tsx'
          ],
          'journal': [
            './src/pages/JournalPage.tsx',
            './src/pages/JournalViewPage.tsx',
            './src/pages/JournalEditPage.tsx'
          ],
          'settings': ['./src/pages/SettingsPage.tsx'],
          'home': ['./src/pages/HomePage.tsx']
        },
        
        // Optimize asset naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        
        // Optimize chunk naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    }
  },
  
  // Development optimizations
  server: {
    // Enable HMR with optimized settings
    hmr: {
      overlay: false
    },
    
    // Optimize dev server performance
    watch: {
      usePolling: false,
      interval: 100
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
      'react-hot-toast',
      'idb'
    ],
    
    // Exclude large dependencies from pre-bundling
    exclude: [
      'jspdf',
      'html2canvas',
      'papaparse',
      'recharts'
    ]
  },
  
  // CSS optimization
  css: {
    // Enable CSS code splitting
    modules: {
      localsConvention: 'camelCase'
    }
  },
  
  // Performance monitoring
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})