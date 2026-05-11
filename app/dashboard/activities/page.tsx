"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, BarChart3, Users, CheckCircle } from "lucide-react";
import { PageShell, PageSection, PageEmpty } from "@/components/layout/PageShell";
import { PageActions } from "@/components/layout/PageActions";
import { FilterBar } from "@/components/layout/FilterBar";
import { KPICard } from "@/components/analytics/KPICard";
import { ActivityChart } from "@/components/analytics/ActivityChart";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { useFilteredSimulations, useActivities } from "@/hooks/useAnalyticsData";
import { computeActivityKPIs, computeMonthlyTrendLocalized, computeKPISummary } from "@/lib/analytics/kpiEngine";
import { fmtNumber, fmtPercent } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";

export default function ActivitiesPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { data: activities = [] } = useActivities();
  const { t, locale } = useI18n();
  const [selected, setSelected] = useState<number | null>(null);

  const kpis = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  const activityKPIs = useMemo(() => computeActivityKPIs(simulations), [simulations]);

  const selectedSims = useMemo(() =>
    selected !== null ? simulations.filter((s) => s.activityId === selected) : simulations,
    [simulations, selected]
  );
  const selectedTrend = useMemo(() => computeMonthlyTrendLocalized(selectedSims, locale), [selectedSims, locale]);
  const selectedActivity = activities.find((a) => a.id === selected);

  return (
    <PageShell
      title={t.nav.activities}
      subtitle={t.scope.organization}
      actions={<PageActions />}
      filters={<FilterBar />}
    >
      <PageSection variant="bare">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard title={t.kpi.totalActivities} value={fmtNumber(activityKPIs.length, locale)} icon={BookOpen} accent="brand" index={0} loading={isLoading} />
          <KPICard title={t.kpi.totalSimulations} value={fmtNumber(kpis.totalSimulations, locale)} icon={BarChart3} accent="violet" index={1} loading={isLoading} />
          <KPICard title={t.kpi.uniqueUsers} value={fmtNumber(kpis.uniqueUsers, locale)} icon={Users} accent="blue" index={2} loading={isLoading} />
          <KPICard title={t.kpi.passRate} value={fmtPercent(kpis.passRate)} icon={CheckCircle} accent="emerald" index={3} loading={isLoading} />
        </div>
      </PageSection>

      <PageSection
        variant="bare"
        title={selectedActivity ? selectedActivity.name : t.charts.activityUsage}
        description={selectedActivity ? t.charts.perUseCase : t.charts.simsByActivity}
        actions={
          selected !== null ? (
            <button
              onClick={() => setSelected(null)}
              className="h-9 px-3 rounded-xl border border-border bg-surface-900/40 text-[12px] font-medium text-text-secondary hover:bg-surface-800/60 transition-colors"
            >
              {t.filters.reset}
            </button>
          ) : null
        }
      >
        <ScoreTrendChart data={selectedTrend} loading={isLoading} />
      </PageSection>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ActivityChart data={activityKPIs.slice(0, 8)} loading={isLoading} metric="simulationCount" />

        <PageSection title={t.kpi.totalActivities} description={t.charts.perUseCase}>
          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-10 rounded-xl" />
              ))}
            </div>
          ) : activityKPIs.length === 0 ? (
            <PageEmpty />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {[t.table.activity, t.kpi.totalSimulations, t.kpi.avgScore, t.kpi.passRate].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-text-muted font-semibold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activityKPIs.slice(0, 20).map((a, i) => (
                    <motion.tr
                      key={a.activityId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => setSelected(selected === a.activityId ? null : a.activityId)}
                      className={cn(
                        "border-b border-border last:border-0 transition-colors cursor-pointer",
                        selected === a.activityId ? "bg-brand-500/10" : "hover:bg-surface-800/30",
                      )}
                    >
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-text-primary block max-w-[420px] truncate" title={a.activityName}>
                          {a.activityName}
                        </span>
                      </td>
                      <td className="px-4 py-3"><span className="text-xs font-mono text-text-muted">{a.simulationCount}</span></td>
                      <td className="px-4 py-3"><span className={cn("text-xs font-mono font-bold", a.averageScore >= 70 ? "text-emerald-400" : a.averageScore >= 50 ? "text-amber-400" : "text-rose-400")}>{a.averageScore.toFixed(0)}%</span></td>
                      <td className="px-4 py-3"><span className="text-xs text-text-secondary">{fmtPercent(a.passRate)}</span></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PageSection>
      </div>
    </PageShell>
  );
}
