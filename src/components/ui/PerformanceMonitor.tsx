import React, { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  domLoad: number; // DOM Content Loaded
  windowLoad: number; // Window Load
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  showDebug?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  onMetricsUpdate,
  showDebug = false
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    domLoad: 0,
    windowLoad: 0
  });
  
  const observerRef = useRef<PerformanceObserver | null>(null);
  const lcpObserverRef = useRef<PerformanceObserver | null>(null);
  const clsObserverRef = useRef<PerformanceObserver | null>(null);
  const fidObserverRef = useRef<PerformanceObserver | null>(null);

  // Measure Time to First Byte
  const measureTTFB = useCallback(() => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        return navigation.responseStart - navigation.requestStart;
      }
    }
    return 0;
  }, []);

  // Measure DOM and Window load times
  const measureLoadTimes = useCallback(() => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        return {
          domLoad: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          windowLoad: navigation.loadEventEnd - navigation.loadEventStart
        };
      }
    }
    return { domLoad: 0, windowLoad: 0 };
  }, []);

  // Initialize performance observers
  useEffect(() => {
    if (!enabled || !('PerformanceObserver' in window)) return;

    // First Contentful Paint
    try {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
        }
      });
      observerRef.current.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('FCP observer not supported:', error);
    }

    // Largest Contentful Paint
    try {
      lcpObserverRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
        }
      });
      lcpObserverRef.current.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP observer not supported:', error);
    }

    // First Input Delay
    try {
      fidObserverRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
        });
      });
      fidObserverRef.current.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID observer not supported:', error);
    }

    // Cumulative Layout Shift
    try {
      clsObserverRef.current = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        setMetrics(prev => ({ ...prev, cls: clsValue }));
      });
      clsObserverRef.current.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS observer not supported:', error);
    }

    // Measure initial metrics
    const ttfb = measureTTFB();
    const { domLoad, windowLoad } = measureLoadTimes();
    setMetrics(prev => ({ ...prev, ttfb, domLoad, windowLoad }));

    return () => {
      observerRef.current?.disconnect();
      lcpObserverRef.current?.disconnect();
      clsObserverRef.current?.disconnect();
      fidObserverRef.current?.disconnect();
    };
  }, [enabled, measureTTFB, measureLoadTimes]);

  // Report metrics
  useEffect(() => {
    if (onMetricsUpdate && Object.values(metrics).some(v => v > 0)) {
      onMetricsUpdate(metrics);
    }
  }, [metrics, onMetricsUpdate]);

  // Performance optimization suggestions
  const getOptimizationSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    
    if (metrics.fcp > 2000) suggestions.push('First Contentful Paint is slow (>2s)');
    if (metrics.lcp > 2500) suggestions.push('Largest Contentful Paint is slow (>2.5s)');
    if (metrics.fid > 100) suggestions.push('First Input Delay is high (>100ms)');
    if (metrics.cls > 0.1) suggestions.push('Cumulative Layout Shift is high (>0.1)');
    if (metrics.ttfb > 600) suggestions.push('Time to First Byte is slow (>600ms)');
    
    return suggestions;
  }, [metrics]);

  if (!enabled) return null;

  return (
    <>
      {showDebug && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
          <h4 className="font-bold mb-2">Performance Metrics</h4>
          <div className="space-y-1">
            <div>FCP: {metrics.fcp.toFixed(0)}ms</div>
            <div>LCP: {metrics.lcp.toFixed(0)}ms</div>
            <div>FID: {metrics.fid.toFixed(0)}ms</div>
            <div>CLS: {metrics.cls.toFixed(3)}</div>
            <div>TTFB: {metrics.ttfb.toFixed(0)}ms</div>
            <div>DOM Load: {metrics.domLoad.toFixed(0)}ms</div>
            <div>Window Load: {metrics.windowLoad.toFixed(0)}ms</div>
          </div>
          
          {getOptimizationSuggestions().length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div className="font-bold text-yellow-400">Suggestions:</div>
              {getOptimizationSuggestions().map((suggestion, index) => (
                <div key={index} className="text-yellow-300">• {suggestion}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PerformanceMonitor;