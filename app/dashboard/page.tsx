"use client";
import { useMemo } from "react";
import {
  Activity, Users, TrendingUp, CheckCircle,
  Calendar, Target, BookOpen, BarChart3,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { KPICard } from "@/components/analytics/KPICard";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { InteractionFunnel } from "@/components/analytics/InteractionFunnel";
import { InsightsPanel } from "@/components/analytics/AIInsightCard";
import { LeaderboardTable } from "@/components/analytics/LeaderboardTable";
import { ActivityChart } from "@/components/analytics/ActivityChart";
import { ScoreDistribution } from "@/components/analytics/ScoreDistribution";
import { useFilteredSimulations, useActivities } from "@/hooks/useAnalyticsData";
import {
  computeKPISummary,
  computeMonthlyTrend,
  computeInteractionKPIs,
  computeActivityKPIs,
  computeUserKPIs,
  computeLeaderboard,
  computeScoreDistribution,
} from "@/lib/analytics/kpiEngine";
import { generateInsights } from "@/lib/analytics/insightEngine";
import { fmtNumber, fmtPercent, fmtScore } from "@/lib/utils/formatters";

export default function ExecutiveOverviewPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { data: activities } = useActivities();

  const kpis = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  const trend = useMemo(() => computeMonthlyTrend(simulations), [simulations]);
  const interactionKPIs = useMemo(() => computeInteractionKPIs(simulations), [simulations]);
  const activityKPIs = useMemo(() => computeActivityKPIs(simulations), [simulations]);
  const userKPIs = useMemo(() => computeUserKPIs(simulations), [simulations]);
  const leaderboard = useMemo(() => computeLeaderboard(simulations), [simulations]);
  const distribution = useMemo(() => computeScoreDistribution(simulations), [simulations]);
  const insights = useMemo(
    () => generateInsights(simulations, interactionKPIs, activityKPIs, userKPIs),
    [simulations, interactionKPIs, activityKPIs, userKPIs]
  );

  return (
    <div className="min-h-full bg-surface-900">
      <TopBar
        title="Executive Overview"
        subtitle="Métricas globales de inteligencia conversacional"
      />

      <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard
            title="Simulaciones"
            value={fmtNumber(kpis.totalSimulations)}
            subtitle={`${kpis.activeDays} días activos`}
            delta={kpis.trend.simulationsDelta}
            trend={kpis.trend.simulationsDelta >= 0 ? "up" : "down"}
            icon={Activity}
            accent="blue"
            index={0}
            loading={isLoading}
          />
          <KPICard
            title="Usuarios Activos"
            value={fmtNumber(kpis.uniqueUsers)}
            subtitle="Asesores únicos"
            icon={Users}
            accent="violet"
            index={1}
            loading={isLoading}
          />
          <KPICard
            title="Puntaje Promedio"
            value={`${kpis.averageScore.toFixed(0)}%`}
            subtitle="Calificación media"
            delta={kpis.trend.scoreDelta}
            trend={kpis.trend.scoreDelta >= 0 ? "up" : "down"}
            icon={TrendingUp}
            accent="cyan"
            index={2}
            loading={isLoading}
          />
          <KPICard
            title="Tasa Aprobación"
            value={fmtPercent(kpis.passRate)}
            subtitle="Diagnóstico aprobatorio"
            delta={kpis.trend.passRateDelta}
            trend={kpis.trend.passRateDelta >= 0 ? "up" : "down"}
            icon={CheckCircle}
            accent="emerald"
            index={3}
            loading={isLoading}
          />
          <KPICard
            title="Actividades"
            value={fmtNumber(kpis.totalActivities)}
            subtitle="Casos de uso activos"
            icon={BookOpen}
            accent="amber"
            index={4}
            loading={isLoading}
          />
          <KPICard
            title="Días Activos"
            value={fmtNumber(kpis.activeDays)}
            subtitle="Con simulaciones"
            icon={Calendar}
            accent="violet"
            index={5}
            loading={isLoading}
          />
        </div>

        {/* Trend + Insights */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <ScoreTrendChart data={trend} loading={isLoading} />
          </div>
          <div>
            <InsightsPanel insights={insights} loading={isLoading} />
          </div>
        </div>

        {/* Interaction Funnel + Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InteractionFunnel data={interactionKPIs} loading={isLoading} />
          <ScoreDistribution data={distribution} loading={isLoading} />
        </div>

        {/* Activity Chart + Leaderboard */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ActivityChart data={activityKPIs} loading={isLoading} />
          <LeaderboardTable entries={leaderboard} loading={isLoading} maxRows={8} />
        </div>
      </div>
    </div>
  );
}
