import React, { useState, useEffect, useRef } from 'react';
import { usePerformanceMonitor } from '../../hooks/usePerformance';

const PerformanceMonitor = ({ 
  show = false, 
  position = 'bottom-right',
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: null,
    renderTime: 0,
    renderCount: 0
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrameId = useRef(null);

  const { renderCount, measureOperation } = usePerformanceMonitor('PerformanceMonitor');

  // FPS calculation
  const calculateFPS = () => {
    const currentTime = performance.now();
    frameCount.current++;
    
    if (currentTime - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
      setMetrics(prev => ({ ...prev, fps }));
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
    
    animationFrameId.current = requestAnimationFrame(calculateFPS);
  };

  // Memory usage (if available)
  const getMemoryInfo = () => {
    if ('memory' in performance) {
      const memory = performance.memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  };

  // Performance observer for navigation timing
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            setMetrics(prev => ({ 
              ...prev, 
              renderTime: Math.round(entry.loadEventEnd - entry.loadEventStart)
            }));
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      
      return () => observer.disconnect();
    }
  }, []);

  // Start FPS monitoring
  useEffect(() => {
    if (isVisible) {
      calculateFPS();
    }
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isVisible]);

  // Update metrics periodically
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        memory: getMemoryInfo(),
        renderCount
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, renderCount]);

  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
      {/* Collapsed view */}
      {!isExpanded && (
        <div className="bg-black bg-opacity-75 text-white rounded-lg p-2 cursor-pointer hover:bg-opacity-90 transition-all duration-200">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${metrics.fps > 50 ? 'bg-green-400' : metrics.fps > 30 ? 'bg-yellow-400' : 'bg-red-400'}`} />
            <span className="text-xs font-mono">{metrics.fps} FPS</span>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              ▶
            </button>
          </div>
        </div>
      )}

      {/* Expanded view */}
      {isExpanded && (
        <div className="bg-black bg-opacity-90 text-white rounded-lg p-4 min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Performance Monitor</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsExpanded(false)}
                className="text-xs opacity-70 hover:opacity-100"
              >
                ▼
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-xs opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {/* FPS */}
            <div className="flex justify-between">
              <span>FPS:</span>
              <span className={`font-mono ${
                metrics.fps > 50 ? 'text-green-400' : 
                metrics.fps > 30 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {metrics.fps}
              </span>
            </div>

            {/* Render Count */}
            <div className="flex justify-between">
              <span>Renders:</span>
              <span className="font-mono">{metrics.renderCount}</span>
            </div>

            {/* Render Time */}
            {metrics.renderTime > 0 && (
              <div className="flex justify-between">
                <span>Render Time:</span>
                <span className="font-mono">{metrics.renderTime}ms</span>
              </div>
            )}

            {/* Memory Usage */}
            {metrics.memory && (
              <>
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="text-xs text-gray-400 mb-1">Memory Usage</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Used:</span>
                      <span className="font-mono">{metrics.memory.used}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-mono">{metrics.memory.total}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Limit:</span>
                      <span className="font-mono">{metrics.memory.limit}MB</span>
                    </div>
                    
                    {/* Memory bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((metrics.memory.used / metrics.memory.limit) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Performance tips */}
            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="text-xs text-gray-400 mb-1">Tips:</div>
              <div className="text-xs space-y-1">
                {metrics.fps < 30 && (
                  <div className="text-red-400">⚠️ Low FPS - Check for expensive operations</div>
                )}
                {metrics.renderCount > 100 && (
                  <div className="text-yellow-400">⚠️ High render count - Consider memoization</div>
                )}
                {metrics.memory && metrics.memory.used > metrics.memory.limit * 0.8 && (
                  <div className="text-red-400">⚠️ High memory usage</div>
                )}
                {metrics.fps > 50 && metrics.renderCount < 50 && (
                  <div className="text-green-400">✅ Good performance</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Performance monitoring hook for components
export const useComponentPerformance = (componentName, options = {}) => {
  const { measureOperation: baseMeasureOperation } = usePerformanceMonitor(componentName);
  
  const measureRender = (operation) => {
    return baseMeasureOperation('render', operation);
  };
  
  const measureOperation = (operationName, operation) => {
    return baseMeasureOperation(operationName, operation);
  };
  
  return { measureRender, measureOperation };
};

// Performance boundary component
export const PerformanceBoundary = ({ children, name, threshold = 100 }) => {
  const { measureRender } = useComponentPerformance(name);
  
  return (
    <div>
      {measureRender(() => children)}
    </div>
  );
};

export default PerformanceMonitor;