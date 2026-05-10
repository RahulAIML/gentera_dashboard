"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Users, TrendingUp, CheckCircle, Calendar, BookOpen } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { KPICard } from "@/components/analytics/KPICard";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { InteractionFunnel } from "@/components/analytics/InteractionFunnel";
import { InsightsPanel } from "@/components/analytics/AIInsightCard";
import { LeaderboardTable } from "@/components/analytics/LeaderboardTable";
import { ActivityChart } from "@/components/analytics/ActivityChart";
import { ScoreDistribution } from "@/components/analytics/ScoreDistribution";
import { useFilteredSimulations } from "@/hooks/useAnalyticsData";
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
import { fmtNumber, fmtPercent } from "@/lib/utils/formatters";
import { useI18n } from "@/lib/i18n";

export default function ExecutiveOverviewPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { t } = useI18n();

  const kpis        = useMemo(() => computeKPISummary(simulations, []),           [simulations]);
  const trend       = useMemo(() => computeMonthlyTrend(simulations),             [simulations]);
  const interaction = useMemo(() => computeInteractionKPIs(simulations),          [simulations]);
  const activity    = useMemo(() => computeActivityKPIs(simulations),             [simulations]);
  const users       = useMemo(() => computeUserKPIs(simulations),                 [simulations]);
  const leaderboard = useMemo(() => computeLeaderboard(simulations),              [simulations]);
  const distribution= useMemo(() => computeScoreDistribution(simulations),        [simulations]);
  const insights    = useMemo(
    () => generateInsights(simulations, interaction, activity, users),
    [simulations, interaction, activity, users]
  );

  return (
    <div className="min-h-full bg-surface-950">
      <TopBar
        title="Resumen Ejecutivo"
        subtitle="Plataforma de Inteligencia Conversacional · Gentera"
      />

      <div className="p-6 space-y-5 max-w-screen-2xl mx-auto">

        {/* ── Hero KPI Row — 4 large KPIs ─────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <KPICard
            title={t.kpi.totalSimulations}
            value={fmtNumber(kpis.totalSimulations)}
            subtitle={`${kpis.activeDays} días activos`}
            delta={kpis.trend.simulationsDelta}
            trend={kpis.trend.simulationsDelta >= 0 ? "up" : "down"}
            icon={Activity}
            accent="brand"
            index={0}
            loading={isLoading}
          />
          <KPICard
            title={t.kpi.passRate}
            value={fmtPercent(kpis.passRate, 0)}
            subtitle="Diagnóstico aprobatorio"
            delta={kpis.trend.passRateDelta}
            trend={kpis.trend.passRateDelta >= 0 ? "up" : "down"}
            icon={CheckCircle}
            accent="emerald"
            index={1}
            loading={isLoading}
          />
          <KPICard
            title={t.kpi.avgScore}
            value={`${kpis.averageScore.toFixed(0)}%`}
            subtitle="Calificación media"
            delta={kpis.trend.scoreDelta}
            trend={kpis.trend.scoreDelta >= 0 ? "up" : "down"}
            icon={TrendingUp}
            accent="violet"
            index={2}
            loading={isLoading}
          />
          <KPICard
            title={t.kpi.uniqueUsers}
            value={fmtNumber(kpis.uniqueUsers)}
            subtitle="Asesores únicos"
            icon={Users}
            accent="blue"
            index={3}
            loading={isLoading}
          />
        </div>

        {/* ── Score Trend + AI Insights ────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <ScoreTrendChart data={trend} loading={isLoading} />
          </div>
          <InsightsPanel insights={insights} loading={isLoading} />
        </div>

        {/* ── 3-col: Activity | Distribution | Funnel ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ActivityChart data={activity} loading={isLoading} />
          <ScoreDistribution data={distribution} loading={isLoading} />
          <InteractionFunnel data={interaction} loading={isLoading} />
        </div>

        {/* ── Full-width Leaderboard ───────────────────────────── */}
        <LeaderboardTable entries={leaderboard} loading={isLoading} maxRows={10} />
      </div>
    </div>
  );
}
