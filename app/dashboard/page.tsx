"use client";
import { useMemo } from "react";
import { Activity, Users, TrendingUp, CheckCircle } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { KPICard } from "@/components/analytics/KPICard";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { InteractionFunnel } from "@/components/analytics/InteractionFunnel";
import { LeaderboardTable } from "@/components/analytics/LeaderboardTable";
import { useFilteredSimulations } from "@/hooks/useAnalyticsData";
import {
  computeKPISummary,
  computeMonthlyTrend,
  computeInteractionKPIs,
  computeLeaderboard,
} from "@/lib/analytics/kpiEngine";
import { fmtNumber, fmtPercent } from "@/lib/utils/formatters";
import { useI18n } from "@/lib/i18n";

export default function ExecutiveOverviewPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { t } = useI18n();

  const kpis        = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  const trend       = useMemo(() => computeMonthlyTrend(simulations),   [simulations]);
  const interaction = useMemo(() => computeInteractionKPIs(simulations),[simulations]);
  const leaderboard = useMemo(() => computeLeaderboard(simulations),    [simulations]);

  return (
    <div className="min-h-full bg-surface-950">
      <TopBar
        title={t.nav.dashboard}
        subtitle={t.scope.organization}
      />

      <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">

        {/* KPI row — 4 clean cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard
            title={t.kpi.totalSimulations}
            value={fmtNumber(kpis.totalSimulations)}
            subtitle={`${kpis.activeDays} ${t.kpi.activeDays.toLowerCase()}`}
            delta={kpis.trend.simulationsDelta}
            trend={kpis.trend.simulationsDelta >= 0 ? "up" : "down"}
            icon={Activity}
            accent="brand"
            index={0}
            loading={isLoading}
          />
          <KPICard
            title={t.kpi.uniqueUsers}
            value={fmtNumber(kpis.uniqueUsers)}
            icon={Users}
            accent="blue"
            index={1}
            loading={isLoading}
          />
          <KPICard
            title={t.kpi.avgScore}
            value={`${kpis.averageScore.toFixed(0)}%`}
            delta={kpis.trend.scoreDelta}
            trend={kpis.trend.scoreDelta >= 0 ? "up" : "down"}
            icon={TrendingUp}
            accent="violet"
            index={2}
            loading={isLoading}
          />
          <KPICard
            title={t.kpi.passRate}
            value={fmtPercent(kpis.passRate, 0)}
            delta={kpis.trend.passRateDelta}
            trend={kpis.trend.passRateDelta >= 0 ? "up" : "down"}
            icon={CheckCircle}
            accent="emerald"
            index={3}
            loading={isLoading}
          />
        </div>

        {/* Primary viz — Score Trend + Interaction Funnel */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          <div className="xl:col-span-3">
            <ScoreTrendChart data={trend} loading={isLoading} />
          </div>
          <div className="xl:col-span-2">
            <InteractionFunnel data={interaction} loading={isLoading} />
          </div>
        </div>

        {/* Leaderboard */}
        <LeaderboardTable entries={leaderboard} loading={isLoading} maxRows={10} />
      </div>
    </div>
  );
}
