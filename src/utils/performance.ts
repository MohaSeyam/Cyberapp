// Performance monitoring utilities
import React from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import * as Sentry from '@sentry/react';

// Initialize Sentry
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN || '', // Add your Sentry DSN here
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', 'your-domain.com'],
    }),
  ],
  tracesSampleRate: 1.0,
});

// Performance metrics tracking
export const trackPerformance = () => {
  // Core Web Vitals
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);

  // Custom performance tracking
  if ('performance' in window) {
    // Navigation Timing API
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      console.log('Navigation Timing:', {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive,
        domComplete: navigation.domComplete,
      });
    }

    // Resource Timing API
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources.filter(resource => resource.duration > 1000);
    if (slowResources.length > 0) {
      console.warn('Slow resources detected:', slowResources);
    }
  }
};

// Error tracking
export const trackError = (error: Error, context?: any) => {
  console.error('Error tracked:', error, context);
  Sentry.captureException(error, {
    extra: context,
  });
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  React.useEffect(() => {
    trackPerformance();
  }, []);
};

// Custom performance marks
export const performanceMarks = {
  start: (name: string) => {
    performance.mark(name);
  },
  end: (name: string) => {
    performance.mark(`${name}-end`);
    performance.measure(name, name, `${name}-end`);
  },
  measure: (name: string, startMark: string, endMark: string) => {
    performance.measure(name, startMark, endMark);
  },
};

// Bundle size monitoring
export const trackBundleSize = () => {
  if ('performance' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          if (resource.name.includes('.js') || resource.name.includes('.css')) {
            console.log('Resource loaded:', {
              name: resource.name,
              size: resource.transferSize,
              duration: resource.duration,
            });
          }
        }
      }
    });
    observer.observe({ entryTypes: ['resource'] });
  }
};

// Memory usage monitoring
export const trackMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('Memory usage:', {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    });
  }
};

// React performance monitoring
export const withPerformanceMonitoring = (Component: React.ComponentType<any>) => {
  return React.memo((props: any) => {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // More than 60fps threshold
        console.warn(`Slow render detected: ${renderTime.toFixed(2)}ms`, Component.name);
      }
    });

    return <Component {...props} />;
  });
};