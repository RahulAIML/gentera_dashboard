"use client";
import { useEffect, useState, useMemo } from "react";
import { Activity, Zap, AlertTriangle } from "lucide-react";

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  apiCalls: number;
  errors: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    apiCalls: 0,
    errors: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  // Performance monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const renderEntries = entries.filter(entry => entry.entryType === 'measure');
      
      if (renderEntries.length > 0) {
        const renderTime = renderEntries.reduce((sum, entry) => sum + entry.duration, 0) / renderEntries.length;
        
        setMetrics(prev => ({
          ...prev,
          renderTime: Math.round(renderTime * 100) / 100,
        }));
      }
    });

    try {
      observer.observe({ entryTypes: ['measure'] });
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }

    return () => observer.disconnect();
  }, []);

  // Memory monitoring
  useEffect(() => {
    const checkMemory = () => {
      if (performance.memory) {
        const memoryUsage = (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memoryUsage * 100) / 100,
        }));
      }
    };

    const interval = setInterval(checkMemory, 5000);
    checkMemory(); // Initial check

    return () => clearInterval(interval);
  }, []);

  // Bundle size estimation
  const bundleSize = useMemo(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        return Math.round((navigation.transferSize || 0) / 1024); // KB
      }
    }
    return 0;
  }, []);

  // Performance status
  const performanceStatus = useMemo(() => {
    const issues = [];
    
    if (metrics.renderTime > 16) issues.push('slow-render');
    if (metrics.memoryUsage > 80) issues.push('high-memory');
    if (bundleSize > 1000) issues.push('large-bundle');
    if (metrics.errors > 0) issues.push('errors');

    if (issues.length === 0) return 'excellent';
    if (issues.length === 1) return 'good';
    if (issues.length === 2) return 'fair';
    return 'poor';
  }, [metrics]);

  const statusConfig = {
    excellent: { color: 'text-emerald-400', icon: Zap, label: 'Excellent' },
    good: { color: 'text-emerald-300', icon: Activity, label: 'Good' },
    fair: { color: 'text-amber-400', icon: AlertTriangle, label: 'Fair' },
    poor: { color: 'text-rose-400', icon: AlertTriangle, label: 'Poor' },
  };

  const currentStatus = statusConfig[performanceStatus];
  const StatusIcon = currentStatus.icon;

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50 p-2 rounded-lg bg-surface-900/90 backdrop-blur-sm border border-surface-700/60 text-surface-400 hover:text-surface-200 transition-colors"
      >
        <Activity className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 bg-surface-900/95 backdrop-blur-xl border border-surface-700/60 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-700/50">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-surface-400" />
          <span className="text-sm font-semibold text-surface-200">Performance Monitor</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-surface-400 hover:text-surface-200 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Status */}
      <div className="p-4 border-b border-surface-700/50">
        <div className="flex items-center gap-3">
          <StatusIcon className={`w-5 h-5 ${currentStatus.color}`} />
          <div>
            <div className={`text-sm font-semibold ${currentStatus.color}`}>
              {currentStatus.label}
            </div>
            <div className="text-xs text-surface-500">
              Overall performance
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-400">Render Time</span>
          <span className={`text-xs font-medium ${
            metrics.renderTime > 16 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {metrics.renderTime}ms
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-400">Memory Usage</span>
          <span className={`text-xs font-medium ${
            metrics.memoryUsage > 80 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {metrics.memoryUsage}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-400">Bundle Size</span>
          <span className={`text-xs font-medium ${
            bundleSize > 1000 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {bundleSize}KB
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-400">API Calls</span>
          <span className="text-xs font-medium text-surface-300">
            {metrics.apiCalls}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-400">Errors</span>
          <span className={`text-xs font-medium ${
            metrics.errors > 0 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {metrics.errors}
          </span>
        </div>
      </div>

      {/* Recommendations */}
      {performanceStatus !== 'excellent' && (
        <div className="p-4 bg-surface-800/50 border-t border-surface-700/50">
          <div className="text-xs text-surface-400 mb-2">Recommendations</div>
          <div className="space-y-1">
            {metrics.renderTime > 16 && (
              <div className="text-xs text-amber-400">• Optimize render performance</div>
            )}
            {metrics.memoryUsage > 80 && (
              <div className="text-xs text-amber-400">• Reduce memory usage</div>
            )}
            {bundleSize > 1000 && (
              <div className="text-xs text-amber-400">• Optimize bundle size</div>
            )}
            {metrics.errors > 0 && (
              <div className="text-xs text-rose-400">• Fix critical errors</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
