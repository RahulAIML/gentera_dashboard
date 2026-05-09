"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, BarChart3, Users, CheckCircle } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { KPICard } from "@/components/analytics/KPICard";
import { ActivityChart } from "@/components/analytics/ActivityChart";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { useFilteredSimulations, useActivities } from "@/hooks/useAnalyticsData";
import {
  computeActivityKPIs,
  computeMonthlyTrend,
  computeKPISummary,
  applyFilters,
} from "@/lib/analytics/kpiEngine";
import { fmtNumber, fmtPercent } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { ActivityKPI } from "@/types/analytics";
import { useFilterStore } from "@/lib/store/filterStore";

export default function ActivitiesPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { data: activities = [] } = useActivities();
  const [selected, setSelected] = useState<number | null>(null);
  const [metric, setMetric] = useState<"simulationCount" | "averageScore" | "passRate">("simulationCount");

  const kpis = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  const activityKPIs = useMemo(() => computeActivityKPIs(simulations), [simulations]);

  const selectedSims = useMemo(() =>
    selected !== null ? simulations.filter((s) => s.activityId === selected) : simulations,
    [simulations, selected]
  );
  const selectedTrend = useMemo(() => computeMonthlyTrend(selectedSims), [selectedSims]);
  const selectedActivity = activities.find((a) => a.id === selected);

  return (
    <div className="min-h-full bg-surface-900">
      <TopBar title="Análisis de Actividades" subtitle="Rendimiento por caso de uso" />

      <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Actividades Activas" value={fmtNumber(activityKPIs.length)} icon={BookOpen} accent="blue" index={0} loading={isLoading} />
          <KPICard title="Total Simulaciones" value={fmtNumber(kpis.totalSimulations)} icon={BarChart3} accent="violet" index={1} loading={isLoading} />
          <KPICard title="Usuarios Únicos" value={fmtNumber(kpis.uniqueUsers)} icon={Users} accent="cyan" index={2} loading={isLoading} />
          <KPICard title="Tasa Aprobación Global" value={fmtPercent(kpis.passRate)} icon={CheckCircle} accent="emerald" index={3} loading={isLoading} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Activity cards */}
          <div className="xl:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Casos de Uso</h3>
              <button
                onClick={() => setSelected(null)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-lg border transition-all",
                  selected === null
                    ? "bg-brand-500/20 border-brand-500 text-brand-400"
                    : "border-border text-text-muted hover:border-surface-300"
                )}
              >
                Todos
              </button>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="glass-card rounded-xl p-4 h-20">
                    <div className="skeleton-shimmer h-3 w-40 rounded mb-2" />
                    <div className="skeleton-shimmer h-2 w-28 rounded" />
                  </div>
                ))
              ) : (
                activityKPIs.map((a, i) => (
                  <motion.button
                    key={a.activityId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelected(selected === a.activityId ? null : a.activityId)}
                    className={cn(
                      "w-full text-left glass-card rounded-xl p-4 transition-all border",
                      selected === a.activityId
                        ? "border-brand-500/50 bg-brand-500/10"
                        : "border-border hover:border-brand-500/30"
                    )}
                  >
                    <div className="text-xs font-semibold text-text-primary mb-1 leading-snug">{a.activityName}</div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-text-muted">{a.simulationCount} sims.</span>
                      <span className={cn(
                        "text-[10px] font-bold",
                        a.averageScore >= 70 ? "text-emerald-400" : a.averageScore >= 50 ? "text-amber-400" : "text-red-400"
                      )}>
                        {a.averageScore.toFixed(0)}%
                      </span>
                      <span className="text-[10px] text-text-muted">{a.uniqueUsers} usuarios</span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-2 bg-surface-600 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${a.passRate * 100}%`,
                          background: a.passRate >= 0.7 ? "#10b981" : a.passRate >= 0.5 ? "#f59e0b" : "#ef4444"
                        }}
                      />
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="xl:col-span-2 space-y-4">
            {selected !== null && selectedActivity && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-4 border border-brand-500/30 bg-brand-500/5"
              >
                <h4 className="text-sm font-bold text-text-primary">{selectedActivity.name}</h4>
                <p className="text-xs text-text-muted mt-0.5">slug: {selectedActivity.slug}</p>
              </motion.div>
            )}

            {/* Metric toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Métrica:</span>
              {(["simulationCount", "averageScore", "passRate"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-lg border transition-all",
                    metric === m
                      ? "bg-brand-500/20 border-brand-500 text-brand-400"
                      : "border-border text-text-muted hover:border-surface-300"
                  )}
                >
                  {m === "simulationCount" ? "Volumen" : m === "averageScore" ? "Puntaje" : "Aprobación"}
                </button>
              ))}
            </div>

            <ActivityChart
              data={selected !== null ? activityKPIs.filter((a) => a.activityId === selected) : activityKPIs}
              metric={metric}
              loading={isLoading}
            />
            <ScoreTrendChart data={selectedTrend} loading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
