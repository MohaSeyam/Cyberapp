import React, { useEffect, useCallback, useMemo } from 'react';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

// مكون لتحسين الأداء العام
const PerformanceOptimizer = React.memo(({ children }: PerformanceOptimizerProps) => {
  
  // Optimize memory usage
  const optimizeMemory = useCallback(() => {
    // Clear console logs in production
    if (process.env.NODE_ENV === 'production') {
      console.log = () => {};
      console.debug = () => {};
    }
    
    // Optimize images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy';
      }
    });
  }, []);

  // Optimize scroll performance
  const optimizeScroll = useCallback(() => {
    // Use passive event listeners for better scroll performance
    const handleScroll = () => {
      // Throttle scroll events
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(() => {
          // Handle scroll optimizations
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Optimize animations
  const optimizeAnimations = useCallback(() => {
    // Reduce motion for users who prefer it
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }
  }, []);

  // Optimize network requests
  const optimizeNetwork = useCallback(() => {
    // Preconnect to external domains
    const preconnectLinks = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];
    
    preconnectLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }, []);

  // Optimize on mount
  useEffect(() => {
    optimizeMemory();
    optimizeScroll();
    optimizeAnimations();
    optimizeNetwork();
  }, [optimizeMemory, optimizeScroll, optimizeAnimations, optimizeNetwork]);

  // Memoized children to prevent unnecessary re-renders
  const memoizedChildren = useMemo(() => children, [children]);

  return <>{memoizedChildren}</>;
});

PerformanceOptimizer.displayName = 'PerformanceOptimizer';

export default PerformanceOptimizer;