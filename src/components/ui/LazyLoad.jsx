import React, { useState, useEffect, useRef, Suspense } from 'react';
import Skeleton from './Skeleton';

const LazyLoad = ({ 
  children, 
  placeholder = null,
  threshold = 0.1,
  rootMargin = '50px',
  fallback = null,
  onLoad = null,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setIsLoading(true);
          
          // Simulate loading delay for better UX
          setTimeout(() => {
            setHasLoaded(true);
            setIsLoading(false);
            if (onLoad) onLoad();
          }, 100);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, hasLoaded, onLoad]);

  // Default placeholder
  const defaultPlaceholder = (
    <div className="space-y-3">
      <Skeleton variant="card" />
      <Skeleton variant="text" lines={2} />
    </div>
  );

  // Custom fallback for loading state
  const loadingFallback = fallback || defaultPlaceholder;

  return (
    <div ref={ref} className={className}>
      {!isVisible && placeholder && (
        <div className="animate-fade-in">
          {placeholder}
        </div>
      )}
      
      {isVisible && !hasLoaded && (
        <div className="animate-fade-in">
          {loadingFallback}
        </div>
      )}
      
      {isVisible && hasLoaded && (
        <div className="animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

// Lazy load with image optimization
export const LazyImage = ({ 
  src, 
  alt, 
  placeholder = null,
  className = '',
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const loadImage = () => {
    if (src && !imageSrc) {
      setIsLoading(true);
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        handleImageLoad();
      };
      img.onerror = handleImageError;
      img.src = src;
    }
  };

  // Default placeholder
  const defaultPlaceholder = (
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse">
      <div className="w-full h-32 bg-gray-300 dark:bg-gray-600 rounded-lg" />
    </div>
  );

  // Error placeholder
  const errorPlaceholder = (
    <div className="bg-red-100 dark:bg-red-900 rounded-lg p-4 text-center">
      <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-sm text-red-600 dark:text-red-400">فشل في تحميل الصورة</p>
    </div>
  );

  return (
    <LazyLoad
      placeholder={placeholder || defaultPlaceholder}
      onLoad={loadImage}
      className={className}
    >
      {imageError ? (
        errorPlaceholder
      ) : imageSrc ? (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-auto transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
          {...props}
        />
      ) : (
        defaultPlaceholder
      )}
    </LazyLoad>
  );
};

// Lazy load with component suspense
export const LazyComponent = ({ 
  component: Component, 
  fallback = null,
  ...props 
}) => {
  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <Component {...props} />
    </Suspense>
  );
};

// Lazy load with virtual scrolling for large lists
export const LazyList = ({ 
  items, 
  renderItem, 
  itemHeight = 60,
  containerHeight = 400,
  overscan = 5,
  className = ''
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = (e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    
    const startIndex = Math.floor(newScrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    
    setVisibleRange({ start: startIndex, end: endIndex });
  };

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={visibleRange.start + index}
            style={{
              position: 'absolute',
              top: (visibleRange.start + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, visibleRange.start + index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LazyLoad;