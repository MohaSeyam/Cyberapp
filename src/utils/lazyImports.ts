// Lazy import utilities for large vendor libraries
// This helps reduce the initial bundle size by loading heavy libraries only when needed

export const lazyImport = {
  // PDF generation - only load when exporting
  jsPDF: () => import('jspdf'),
  
  // Excel/CSV handling - only load when exporting
  // XLSX: () => import('xlsx'), // Removed - not available
  
  // CSV parsing - only load when importing
  // Papa: () => import('papaparse'), // Removed - not available
  
  // QR code generation - only load when needed
  // QRCode: () => import('qrcode'), // Removed - not available
  
  // Rich text editor - only load when editing
  RichTextEditor: () => import('../components/editors/RichTextEditor'),
  
  // Advanced analytics - only load when viewing analytics
  AdvancedDashboard: () => import('../components/analytics/AdvancedDashboard'),
  
  // Smart recommendations - only load when viewing recommendations
  SmartRecommendations: () => import('../components/smart/SmartRecommendations'),
  
  // Calendar integration - only load when using calendar features
  CalendarIntegration: () => import('../components/integrations/CalendarIntegration'),
  
  // Advanced notifications - only load when using notification features
  AdvancedNotifications: () => import('../components/notifications/AdvancedNotifications'),
  
  // Auto backup - only load when using backup features
  AutoBackup: () => import('../components/backup/AutoBackup'),
};

// Helper function to load a library with error handling
export const loadLibrary = async (libraryName: keyof typeof lazyImport) => {
  try {
    const module = await lazyImport[libraryName]();
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load library: ${libraryName}`, error);
    throw new Error(`Failed to load ${libraryName}`);
  }
};

// Preload critical libraries when user shows interest
export const preloadLibrary = (libraryName: keyof typeof lazyImport) => {
  // Use requestIdleCallback if available, otherwise setTimeout
  const schedule = window.requestIdleCallback || ((fn: () => void) => setTimeout(fn, 100));
  
  schedule(() => {
    lazyImport[libraryName]().catch(() => {
      // Silently fail preloading
    });
  });
};