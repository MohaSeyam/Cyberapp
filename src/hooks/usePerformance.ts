import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  componentRenderTime: number;
  memoryUsage: number;
  networkLatency: number;
  fps: number;
  errors: number;
}

interface PerformanceConfig {
  enableMonitoring: boolean;
  logToConsole: boolean;
  sendToAnalytics: boolean;
  sampleRate: number;
}

export const usePerformance = (config: Partial<PerformanceConfig> = {}) => {
  const {
    enableMonitoring = true,
    logToConsole = false,
    sendToAnalytics = false,
    sampleRate = 0.1 // 10% of users
  } = config;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    componentRenderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    fps: 0,
    errors: 0
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const errorCount = useRef(0);
  const renderStartTime = useRef(0);

  // Measure FPS
  const measureFPS = useCallback(() => {
    if (!enableMonitoring) return;

    const now = performance.now();
    frameCount.current++;

    if (now - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
      setMetrics(prev => ({ ...prev, fps }));
      
      frameCount.current = 0;
      lastTime.current = now;
    }

    requestAnimationFrame(measureFPS);
  }, [enableMonitoring]);

  // Measure memory usage
  const measureMemory = useCallback(() => {
    if (!enableMonitoring || !('memory' in performance)) return;

    const memory = (performance as any).memory;
    const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    
    setMetrics(prev => ({ ...prev, memoryUsage }));
  }, [enableMonitoring]);

  // Measure network latency
  const measureNetworkLatency = useCallback(async () => {
    if (!enableMonitoring) return;

    try {
      const start = performance.now();
      await fetch('/api/ping', { method: 'HEAD' });
      const end = performance.now();
      
      setMetrics(prev => ({ ...prev, networkLatency: end - start }));
    } catch (error) {
      // Network measurement failed, skip
    }
  }, [enableMonitoring]);

  // Start performance monitoring
  useEffect(() => {
    if (!enableMonitoring) return;

    // Measure page load time
    const pageLoadTime = performance.now();
    setMetrics(prev => ({ ...prev, pageLoadTime }));

    // Start FPS monitoring
    requestAnimationFrame(measureFPS);

    // Start memory monitoring
    const memoryInterval = setInterval(measureMemory, 5000);

    // Start network monitoring
    const networkInterval = setInterval(measureNetworkLatency, 10000);

    // Error monitoring
    const handleError = (event: ErrorEvent) => {
      errorCount.current++;
      setMetrics(prev => ({ ...prev, errors: errorCount.current }));
      
      if (logToConsole) {
        console.error('Performance Error:', event.error);
      }
    };

    window.addEventListener('error', handleError);

    return () => {
      clearInterval(memoryInterval);
      clearInterval(networkInterval);
      window.removeEventListener('error', handleError);
    };
  }, [enableMonitoring, measureFPS, measureMemory, measureNetworkLatency, logToConsole]);

  // Component render time measurement
  const startRenderTimer = useCallback(() => {
    if (!enableMonitoring) return;
    renderStartTime.current = performance.now();
  }, [enableMonitoring]);

  const endRenderTimer = useCallback(() => {
    if (!enableMonitoring) return;
    
    const renderTime = performance.now() - renderStartTime.current;
    setMetrics(prev => ({ ...prev, componentRenderTime: renderTime }));
  }, [enableMonitoring]);

  // Performance insights
  const getPerformanceInsights = useCallback(() => {
    const insights = {
      isGood: true,
      issues: [] as string[],
      recommendations: [] as string[]
    };

    if (metrics.fps < 30) {
      insights.isGood = false;
      insights.issues.push('Low FPS detected');
      insights.recommendations.push('Consider optimizing animations or reducing component complexity');
    }

    if (metrics.memoryUsage > 100) {
      insights.isGood = false;
      insights.issues.push('High memory usage');
      insights.recommendations.push('Check for memory leaks or optimize data structures');
    }

    if (metrics.networkLatency > 1000) {
      insights.isGood = false;
      insights.issues.push('Slow network response');
      insights.recommendations.push('Consider implementing caching or optimizing API calls');
    }

    if (metrics.errors > 0) {
      insights.isGood = false;
      insights.issues.push('JavaScript errors detected');
      insights.recommendations.push('Review error logs and fix issues');
    }

    return insights;
  }, [metrics]);

  // Send metrics to analytics
  const sendMetrics = useCallback(() => {
    if (!sendToAnalytics || Math.random() > sampleRate) return;

    try {
      // Send to your analytics service
      // analytics.track('performance_metrics', metrics);
      console.log('Performance metrics:', metrics);
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }, [metrics, sendToAnalytics, sampleRate]);

  // Auto-send metrics periodically
  useEffect(() => {
    if (!sendToAnalytics) return;

    const interval = setInterval(sendMetrics, 60000); // Every minute
    return () => clearInterval(interval);
  }, [sendMetrics, sendToAnalytics]);

  return {
    metrics,
    startRenderTimer,
    endRenderTimer,
    getPerformanceInsights,
    sendMetrics
  };
};