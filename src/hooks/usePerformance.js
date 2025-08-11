import { useCallback, useMemo, useRef, useEffect } from 'react';
import { useState } from 'react';

/**
 * Custom hook for debouncing function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const useDebounce = (func, delay) => {
  const timeoutRef = useRef(null);

  const debouncedFunc = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      func(...args);
    }, delay);
  }, [func, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFunc;
};

/**
 * Custom hook for throttling function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const useThrottle = (func, limit) => {
  const inThrottle = useRef(false);

  const throttledFunc = useCallback((...args) => {
    if (!inThrottle.current) {
      func(...args);
      inThrottle.current = true;
      setTimeout(() => {
        inThrottle.current = false;
      }, limit);
    }
  }, [func, limit]);

  return throttledFunc;
};

/**
 * Custom hook for memoizing expensive calculations
 * @param {Function} factory - Function that returns the value to memoize
 * @param {Array} deps - Dependencies array
 * @returns {any} Memoized value
 */
export const useMemoizedValue = (factory, deps) => {
  return useMemo(factory, deps);
};

/**
 * Custom hook for memoizing expensive functions
 * @param {Function} callback - Function to memoize
 * @param {Array} deps - Dependencies array
 * @returns {Function} Memoized function
 */
export const useMemoizedCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

/**
 * Custom hook for intersection observer (lazy loading)
 * @param {Object} options - Intersection observer options
 * @returns {Object} { ref, isIntersecting }
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref);

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [ref, options]);

  return { ref: setRef, isIntersecting };
};

/**
 * Custom hook for measuring component render performance
 * @param {string} componentName - Name of the component for logging
 * @returns {Object} Performance measurement utilities
 */
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current} in ${timeSinceLastRender.toFixed(2)}ms`);
    }
    
    lastRenderTime.current = currentTime;
  });

  const measureOperation = useCallback((operationName, operation) => {
    const start = performance.now();
    const result = operation();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} - ${operationName}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    measureOperation
  };
};

/**
 * Custom hook for virtual scrolling optimization
 * @param {Array} items - Array of items to virtualize
 * @param {number} itemHeight - Height of each item
 * @param {number} containerHeight - Height of the container
 * @returns {Object} Virtual scrolling data
 */
export const useVirtualScrolling = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%'
      }
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    setScrollTop
  };
};