"use client";
import { useMemo, useCallback } from "react";
import { useFilteredSimulations } from "./useAnalyticsData";
import {
  computeKPISummary,
  computeMonthlyTrendLocalized,
  computeLeaderboard,
  computeActivityKPIs,
  computeInteractionKPIsLocalized,
  computeUserKPIs,
} from "@/lib/analytics/kpiEngine";
import { generateInsights } from "@/lib/analytics/insightEngine";

// Memoized data hooks for better performance
export function useOptimizedData(locale: string) {
  const { simulations, isLoading } = useFilteredSimulations();

  // Memoized KPI calculations
  const kpis = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  
  const trend = useMemo(() => computeMonthlyTrendLocalized(simulations, locale as any), [simulations, locale]);
  
  const leaderboard = useMemo(() => computeLeaderboard(simulations), [simulations]);
  
  const activityKPIs = useMemo(() => computeActivityKPIs(simulations), [simulations]);
  
  const interactionKPIs = useMemo(() => computeInteractionKPIsLocalized(simulations, locale as any), [simulations, locale]);
  
  const userKPIs = useMemo(() => computeUserKPIs(simulations), [simulations]);
  
  const insights = useMemo(() => generateInsights(simulations, locale as any), [simulations, locale]);

  // Memoized derived data
  const topPerformers = useMemo(() => leaderboard.slice(0, 6), [leaderboard]);
  
  const criticalInsights = useMemo(() => 
    insights.filter(insight => 
      insight.severity === "critical" || insight.severity === "warning"
    ).slice(0, 3),
    [insights]
  );

  const optimizedInteractionKPIs = useMemo(() => 
    interactionKPIs.map(item => ({
      round: item.roundIndex,
      passRate: item.passRate * 100,
      totalApplicable: item.totalApplicable,
      label: `Round ${item.roundIndex + 1}`
    })),
    [interactionKPIs]
  );

  // Performance monitoring
  const performanceMetrics = useMemo(() => ({
    totalSimulations: simulations.length,
    processingTime: Date.now(),
    memoryUsage: (performance as any).memory ? {
      used: (performance as any).memory.usedJSHeapSize,
      total: (performance as any).memory.totalJSHeapSize,
    } : null,
  }), [simulations]);

  return {
    // Raw data
    simulations,
    isLoading,
    
    // Computed metrics
    kpis,
    trend,
    leaderboard,
    activityKPIs,
    interactionKPIs: optimizedInteractionKPIs,
    userKPIs,
    insights,
    
    // Derived data
    topPerformers,
    criticalInsights,
    
    // Performance metrics
    performanceMetrics,
  };
}

// Optimized formatter functions
export const useOptimizedFormatters = () => {
  const formatNumber = useCallback((num: number, locale: string) => {
    return new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US").format(num);
  }, []);

  const formatPercent = useCallback((num: number, locale: string) => {
    return new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(num);
  }, []);

  const formatCurrency = useCallback((num: number, locale: string) => {
    return new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  }, []);

  return {
    formatNumber,
    formatPercent,
    formatCurrency,
  };
};

// Debounced search hook
export function useDebounceSearch<T extends Record<string, any>>(
  searchFn: (query: string) => T[],
  delay: number = 300
) {
  const debouncedSearch = useCallback(
    (query: string) => {
      const timeoutId = setTimeout(() => {
        return searchFn(query);
      }, delay);
      
      return () => clearTimeout(timeoutId);
    },
    [searchFn, delay]
  );

  return debouncedSearch;
}
