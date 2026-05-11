"use client";
import { useMemo } from "react";
import { Users, BarChart3, TrendingUp, Target, Calendar, BookOpen, Trophy } from "lucide-react";
import Link from "next/link";
import { PageShell, PageSection, PageEmpty } from "@/components/layout/PageShell";
import { PageActions } from "@/components/layout/PageActions";
import { FilterBar } from "@/components/layout/FilterBar";
import { KPICard } from "@/components/analytics/KPICard";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { InsightsPanel } from "@/components/analytics/AIInsightCard";
import { ActivityChart } from "@/components/analytics/ActivityChart";
import { useFilteredSimulations, useHierarchy } from "@/hooks/useAnalyticsData";
import {
  computeKPISummary,
  computeMonthlyTrendLocalized,
  computeLeaderboard,
  computeActivityKPIs,
  computeInteractionKPIsLocalized,
  computeUserKPIs,
} from "@/lib/analytics/kpiEngine";
import { generateInsights } from "@/lib/analytics/insightEngine";
import { fmtNumber, fmtPercent } from "@/lib/utils/formatters";
import { useI18n } from "@/lib/i18n";

export default function ExecutiveOverviewPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const hierarchy = useHierarchy();
  const { t, locale } = useI18n();

  const kpis = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  const trend = useMemo(() => computeMonthlyTrendLocalized(simulations, locale), [simulations, locale]);
  const leaderboard = useMemo(() => computeLeaderboard(simulations), [simulations]);
  const activityKPIs = useMemo(() => computeActivityKPIs(simulations), [simulations]);
  const interactionKPIs = useMemo(() => computeInteractionKPIsLocalized(simulations, locale), [simulations, locale]);
  const userKPIs = useMemo(() => computeUserKPIs(simulations), [simulations]);
  const insights = useMemo(
    () => generateInsights(simulations, interactionKPIs, activityKPIs, userKPIs, locale),
    [simulations, interactionKPIs, activityKPIs, userKPIs, locale],
  );

  const topUsers = leaderboard.slice(0, 5);

  return (
    <PageShell
      title={t.nav.dashboard}
      subtitle={t.scope.organization}
      actions={<PageActions />}
      filters={<FilterBar />}
    >
      {/* Primary KPIs */}
      <PageSection variant="bare">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
          <KPICard title={t.kpi.totalSimulations} value={fmtNumber(kpis.totalSimulations, locale)} icon={BarChart3} accent="brand" loading={isLoading} index={0} />
          <KPICard title={t.kpi.uniqueUsers} value={fmtNumber(kpis.uniqueUsers, locale)} icon={Users} accent="blue" loading={isLoading} index={1} />
          <KPICard title={t.kpi.avgScore} value={`${kpis.averageScore.toFixed(0)}%`} icon={TrendingUp} accent="violet" loading={isLoading} index={2} />
          <KPICard title={t.kpi.passRate} value={fmtPercent(kpis.passRate)} icon={Target} accent="emerald" loading={isLoading} index={3} />
          <KPICard title={t.kpi.totalActivities} value={fmtNumber(kpis.totalActivities, locale)} icon={BookOpen} accent="cyan" loading={isLoading} index={4} />
          <KPICard title={t.kpi.activeDays} value={fmtNumber(kpis.activeDays, locale)} icon={Calendar} accent="amber" loading={isLoading} index={5} />
        </div>
      </PageSection>

      {/* Primary visualization + AI insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ScoreTrendChart data={trend} loading={isLoading} />
        </div>
        <InsightsPanel insights={insights} loading={isLoading} />
      </div>

      {/* Secondary insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <PageSection
          title={t.scope.hierarchy}
          description={t.scope.organization}
        >
          {!hierarchy ? (
            <PageEmpty message={t.common.loading} />
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: t.scope.supervisors, value: hierarchy.totals.supervisors },
                { label: t.scope.admins, value: hierarchy.totals.admins },
                { label: t.scope.participants, value: hierarchy.totals.participants },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-surface-800/40 p-4">
                  <div className="text-[12px] text-text-muted">{s.label}</div>
                  <div className="text-[22px] font-bold text-text-primary tabular-nums mt-1">
                    {fmtNumber(s.value, locale)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageSection>

        <PageSection title={t.charts.leaderboard} description={t.charts.leaderboardSub}>
          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-10 rounded-xl" />
              ))}
            </div>
          ) : topUsers.length === 0 ? (
            <PageEmpty />
          ) : (
            <div className="space-y-2">
              {topUsers.map((u) => (
                <Link
                  key={u.userName}
                  href="/dashboard/leaderboard"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-border hover:bg-surface-800/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-300">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-text-primary truncate">{u.userName}</div>
                    <div className="text-[11px] text-text-muted">
                      {u.simulations} {t.charts.simAbbrev}
                    </div>
                  </div>
                  <div className="text-[13px] font-semibold text-text-primary tabular-nums">
                    {u.avgScore.toFixed(0)}%
                  </div>
                </Link>
              ))}
            </div>
          )}
        </PageSection>

        <ActivityChart
          data={activityKPIs.slice(0, 8)}
          loading={isLoading}
          metric="simulationCount"
        />
      </div>
    </PageShell>
  );
}
