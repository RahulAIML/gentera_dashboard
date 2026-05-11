"use client";
import { 
  TrendingUp, 
  Users, 
  Target, 
  Calendar, 
  BookOpen, 
  Brain,
  ArrowUpRight,
  Activity,
  Eye,
  Trophy
} from "lucide-react";
import { ExecutiveLayout, ExecutiveSection, ExecutiveGrid, ExecutiveMetricRow } from "@/components/layout/ExecutiveLayout";
import { ExecutiveKPICard } from "@/components/analytics/ExecutiveKPICard";
import { ExecutiveTrendChart } from "@/components/charts/ExecutiveTrendChart";
import { ExecutiveFunnelChart } from "@/components/charts/ExecutiveFunnelChart";
import { FilterBar } from "@/components/layout/FilterBar";
import { PageActions } from "@/components/layout/PageActions";
import { ExecutiveSidebar } from "@/components/layout/ExecutiveSidebar";
import { ExecutiveAIAssistant } from "@/components/ai/ExecutiveAIAssistant";
import { useOptimizedData, useOptimizedFormatters } from "@/hooks/useOptimizedData";
import { useHierarchy } from "@/hooks/useAnalyticsData";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";

export default function ExecutiveOverviewPage() {
  const hierarchy = useHierarchy();
  const { t, locale } = useI18n();
  const { formatNumber, formatPercentAsNumber } = useOptimizedFormatters();
  
  const {
    simulations,
    isLoading,
    kpis,
    trend,
    activityKPIs,
    interactionKPIs,
    userKPIs,
    topPerformers,
    criticalInsights,
  } = useOptimizedData(locale);

  return (
    <ExecutiveLayout
      sidebar={<ExecutiveSidebar />}
      filters={<FilterBar />}
      actions={<PageActions />}
      aiAssistant={<ExecutiveAIAssistant />}
    >
      {/* Executive Summary */}
      <ExecutiveSection
        title={t.nav.dashboard}
        subtitle="Conversational Intelligence Overview"
        size="full"
      >
        {/* Primary KPIs - Executive Focus */}
        <ExecutiveMetricRow>
          <ExecutiveKPICard
            title={t.kpi.totalSimulations}
            value={formatNumber(kpis.totalSimulations, locale)}
            icon={Activity}
            accent="brand"
            loading={isLoading}
            index={0}
            delta={kpis.trend.simulationsDelta}
            trend={kpis.trend.simulationsDelta > 0 ? "up" : kpis.trend.simulationsDelta < 0 ? "down" : "neutral"}
          />
          <ExecutiveKPICard
            title={t.kpi.uniqueUsers}
            value={formatNumber(kpis.uniqueUsers, locale)}
            icon={Users}
            accent="emerald"
            loading={isLoading}
            index={1}
            delta={0}
            trend="neutral"
          />
          <ExecutiveKPICard
            title={t.kpi.averageScore}
            value={kpis.avgScore.toFixed(1)}
            icon={Target}
            accent="amber"
            loading={isLoading}
            index={2}
            delta={kpis.trend.scoreDelta}
            trend={kpis.trend.scoreDelta > 0 ? "up" : kpis.trend.scoreDelta < 0 ? "down" : "neutral"}
          />
          <ExecutiveKPICard
            title={t.kpi.passRate}
            value={formatPercentAsNumber(kpis.passRate)}
            icon={TrendingUp}
            accent="rose"
            loading={isLoading}
            index={3}
            delta={kpis.trend.passRateDelta}
            trend={kpis.trend.passRateDelta > 0 ? "up" : kpis.trend.passRateDelta < 0 ? "down" : "neutral"}
          />
        </ExecutiveMetricRow>
      </ExecutiveSection>

      {/* Performance Analytics */}
      <ExecutiveSection
        title="Performance Analytics"
        subtitle="Trends and interaction patterns"
      >
        <ExecutiveGrid cols={2} gap="lg">
          {/* Monthly Trend */}
          <ExecutiveTrendChart
            data={trend}
            metric="simulations"
            title="Monthly Trend"
            subtitle="Simulation volume over time"
            showArea={true}
            accentColor="brand"
          />

          {/* Interaction Funnel */}
          <ExecutiveFunnelChart
            data={interactionKPIs}
            title="Interaction Funnel"
            subtitle="Pass rates by conversation round"
            showThreshold={true}
            threshold={70}
          />
        </ExecutiveGrid>
      </ExecutiveSection>

      {/* Critical Insights */}
      <ExecutiveSection
        title="Critical Insights"
        subtitle="AI-powered analysis and recommendations"
      >
        <ExecutiveGrid cols={3} gap="lg">
          {/* Critical Insights */}
          <div className="bg-surface-800/60 backdrop-blur-sm border border-surface-700/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-surface-50">Critical Insights</h3>
              <Brain className="w-5 h-5 text-brand-400" />
            </div>
            <div className="space-y-3">
              {criticalInsights.length > 0 ? (
                criticalInsights.map((insight, index) => (
                  <div key={insight.id} className="p-3 rounded-xl bg-surface-900/60 border border-surface-700/50">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                        insight.severity === "critical" ? "bg-rose-500" : "bg-amber-500"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-200 leading-tight mb-1">
                          {insight.title}
                        </p>
                        <p className="text-xs text-surface-400 leading-relaxed line-clamp-2">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Eye className="w-8 h-8 text-surface-600 mx-auto mb-2" />
                  <p className="text-sm text-surface-400">No critical insights</p>
                  <p className="text-xs text-surface-500 mt-1">All metrics within normal range</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-surface-800/60 backdrop-blur-sm border border-surface-700/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-50">Top Performers</h3>
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-3">
              {topPerformers.length > 0 ? (
                topPerformers.map((user, index) => (
                  <div key={user.userName} className="flex items-center justify-between p-3 rounded-xl bg-surface-900/60 border border-surface-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.rank}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-200">{user.userName}</p>
                        <p className="text-xs text-surface-400">{user.simulations} simulations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-400">{user.avgScore.toFixed(1)}</p>
                      <p className="text-xs text-surface-400">{formatPercentAsNumber(user.passRate / 100)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-surface-600 mx-auto mb-2" />
                  <p className="text-sm text-surface-400">No performers data</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Breakdown */}
          <div className="bg-surface-800/60 backdrop-blur-sm border border-surface-700/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-50">Activity Breakdown</h3>
              <BookOpen className="w-5 h-5 text-violet-400" />
            </div>
            <div className="space-y-3">
              {activityKPIs.slice(0, 5).length > 0 ? (
                activityKPIs.slice(0, 5).map((activity, index) => (
                  <div key={activity.activityId} className="flex items-center justify-between p-3 rounded-xl bg-surface-900/60 border border-surface-700/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-200 truncate">{activity.activityName}</p>
                      <p className="text-xs text-surface-400">{activity.simulationCount} simulations</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-brand-400">{activity.averageScore.toFixed(1)}</p>
                      <p className="text-xs text-surface-400">{formatPercentAsNumber(activity.passRate / 100)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-8 h-8 text-surface-600 mx-auto mb-2" />
                  <p className="text-sm text-surface-400">No activity data</p>
                </div>
              )}
            </div>
          </div>
        </ExecutiveGrid>
      </ExecutiveSection>

      {/* Organizational Overview */}
      <ExecutiveSection
        title="Organizational Overview"
        subtitle="Hierarchy and structure analysis"
      >
        <ExecutiveGrid cols={3} gap="lg">
          <ExecutiveKPICard
            title="Total Activities"
            value={kpis.totalActivities.toString()}
            icon={BookOpen}
            accent="violet"
            loading={isLoading}
            index={4}
          />
          <ExecutiveKPICard
            title="Active Days"
            value={kpis.activeDays.toString()}
            icon={Calendar}
            accent="emerald"
            loading={isLoading}
            index={5}
          />
          <ExecutiveKPICard
            title="Team Members"
            value={userKPIs.length.toString()}
            icon={Users}
            accent="brand"
            loading={isLoading}
            index={6}
          />
        </ExecutiveGrid>
      </ExecutiveSection>

      {/* Performance Monitor (Development Only) */}
      {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
    </ExecutiveLayout>
  );
}
