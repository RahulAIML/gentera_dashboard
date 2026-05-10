"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, BarChart3, Users, CheckCircle } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { KPICard } from "@/components/analytics/KPICard";
import { ActivityChart } from "@/components/analytics/ActivityChart";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { useFilteredSimulations, useActivities } from "@/hooks/useAnalyticsData";
import { computeActivityKPIs, computeMonthlyTrend, computeKPISummary } from "@/lib/analytics/kpiEngine";
import { fmtNumber, fmtPercent } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";

export default function ActivitiesPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { data: activities = [] } = useActivities();
  const { t } = useI18n();
  const [selected, setSelected] = useState<number | null>(null);

  const kpis = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  const activityKPIs = useMemo(() => computeActivityKPIs(simulations), [simulations]);

  const selectedSims = useMemo(() =>
    selected !== null ? simulations.filter((s) => s.activityId === selected) : simulations,
    [simulations, selected]
  );
  const selectedTrend = useMemo(() => computeMonthlyTrend(selectedSims), [selectedSims]);
  const selectedActivity = activities.find((a) => a.id === selected);

  return (
    <div className="min-h-full bg-surface-950">
      <TopBar title={t.nav.activities} subtitle={t.scope.organization} />

      <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard title={t.kpi.totalActivities} value={fmtNumber(activityKPIs.length)} icon={BookOpen} accent="brand" index={0} loading={isLoading} />
          <KPICard title={t.kpi.totalSimulations} value={fmtNumber(kpis.totalSimulations)} icon={BarChart3} accent="violet" index={1} loading={isLoading} />
          <KPICard title={t.kpi.uniqueUsers} value={fmtNumber(kpis.uniqueUsers)} icon={Users} accent="blue" index={2} loading={isLoading} />
          <KPICard title={t.kpi.passRate} value={fmtPercent(kpis.passRate)} icon={CheckCircle} accent="emerald" index={3} loading={isLoading} />
        </div>

        {/* Main Content Grid: Sidebar + Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Activity Selector - Left Sidebar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-text-muted uppercase">{t.kpi.totalActivities}</h3>
              {selected !== null && (
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs px-2 py-1 rounded text-brand-400 hover:bg-brand-500/5 transition"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-lg p-3 border border-border bg-surface-900/60 h-16" />
                ))
              ) : (
                activityKPIs.slice(0, 15).map((a) => (
                  <motion.button
                    key={a.activityId}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelected(selected === a.activityId ? null : a.activityId)}
                    className={cn(
                      "w-full text-left rounded-lg p-3 transition-all border text-xs",
                      selected === a.activityId ? "border-brand-500/40 bg-brand-500/5" : "border-border bg-surface-900/30 hover:border-brand-500/20"
                    )}
                  >
                    <div className="font-medium text-text-primary truncate mb-1">{a.activityName}</div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-text-muted">{a.simulationCount} sims</span>
                      <span className={cn("font-bold", a.averageScore >= 70 ? "text-emerald-400" : a.averageScore >= 50 ? "text-amber-400" : "text-rose-400")}>
                        {a.averageScore.toFixed(0)}%
                      </span>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>

          {/* Right Panel: Charts - 3 cols */}
          <div className="lg:col-span-3 space-y-5">
            {selected !== null && selectedActivity && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-semibold text-brand-400">
                {selectedActivity.name}
              </motion.div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ActivityChart data={selected !== null ? activityKPIs.filter((a) => a.activityId === selected) : activityKPIs} loading={isLoading} />
              <ScoreTrendChart data={selectedTrend} loading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
