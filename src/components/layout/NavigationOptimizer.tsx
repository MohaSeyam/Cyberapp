import React, { useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationOptimizerProps {
  children: React.ReactNode;
}

// مكون لتحسين الأداء في التنقل
const NavigationOptimizer = React.memo(({ children }: NavigationOptimizerProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Preload critical pages based on current location
  const preloadCriticalPages = useCallback(() => {
    const currentPath = location.pathname;
    
    // Preload based on current page
    if (currentPath === '/') {
      // Preload phases page when on home
      try {
        import('../pages/PhasesPage');
      } catch (e) {
        console.error('Failed to preload PhasesPage:', e);
      }
    } else if (currentPath === '/phases') {
      // Preload progress page when on phases
      try {
        import('../pages/ProgressPage');
      } catch (e) {
        console.error('Failed to preload ProgressPage:', e);
      }
    } else if (currentPath.startsWith('/phase/')) {
      // Preload days page when on phase
      try {
        import('../components/days/DaysPage');
      } catch (e) {
        console.error('Failed to preload DaysPage:', e);
      }
    } else if (currentPath.startsWith('/days/')) {
      // Preload day view when on days
      try {
        import('../components/days/DayViewPage');
      } catch (e) {
        console.error('Failed to preload DayViewPage:', e);
      }
    }
  }, [location.pathname]);

  // Optimize navigation with debouncing
  const optimizedNavigate = useCallback((path: string, options?: { replace?: boolean }) => {
    // Add loading state
    const loadingEvent = new CustomEvent('navigationStart');
    window.dispatchEvent(loadingEvent);
    
    // Navigate with a small delay to show loading state
    setTimeout(() => {
      navigate(path, options);
      
      // Remove loading state
      const endEvent = new CustomEvent('navigationEnd');
      window.dispatchEvent(endEvent);
    }, 50);
  }, [navigate]);

  // Preload pages on mount and route change
  useEffect(() => {
    preloadCriticalPages();
  }, [preloadCriticalPages]);

  // Add global navigation optimization
  useEffect(() => {
    // Override window.history.pushState for better performance
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      const loadingEvent = new CustomEvent('navigationStart');
      window.dispatchEvent(loadingEvent);
      
      originalPushState.apply(window.history, args);
      
      setTimeout(() => {
        const endEvent = new CustomEvent('navigationEnd');
        window.dispatchEvent(endEvent);
      }, 100);
    };

    return () => {
      window.history.pushState = originalPushState;
    };
  }, []);

  // Memoized children to prevent unnecessary re-renders
  const memoizedChildren = useMemo(() => children, [children]);

  return <>{memoizedChildren}</>;
});

NavigationOptimizer.displayName = 'NavigationOptimizer';

export default NavigationOptimizer;