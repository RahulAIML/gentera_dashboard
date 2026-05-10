"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Activity, Calendar } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { KPICard } from "@/components/analytics/KPICard";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { useFilteredSimulations } from "@/hooks/useAnalyticsData";
import {
  computeKPISummary,
  computeMonthlyTrend,
  computeWeeklyTrend,
  computeHeatmap,
} from "@/lib/analytics/kpiEngine";
import { fmtNumber, fmtPercent } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const DAYS  = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6–22

export default function TrendsPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { t } = useI18n();
  const [granularity, setGranularity] = useState<"monthly" | "weekly">("monthly");

  const kpis         = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  const monthlyTrend = useMemo(() => computeMonthlyTrend(simulations),   [simulations]);
  const weeklyTrend  = useMemo(() => computeWeeklyTrend(simulations),    [simulations]);
  const heatmap      = useMemo(() => computeHeatmap(simulations),         [simulations]);

  const trendData   = granularity === "monthly" ? monthlyTrend : weeklyTrend;
  const maxHeatCount = Math.max(...heatmap.map((h) => h.count), 1);

  function getHeatColor(count: number) {
    const intensity = count / maxHeatCount;
    if (intensity === 0)     return "rgba(30,33,56,0.6)";
    if (intensity < 0.25)    return "rgba(99,102,241,0.18)";
    if (intensity < 0.5)     return "rgba(99,102,241,0.4)";
    if (intensity < 0.75)    return "rgba(99,102,241,0.65)";
    return "rgba(99,102,241,0.9)";
  }

  function VolumeTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-surface-700 border border-border rounded-xl p-3 text-xs shadow-xl">
        <p className="font-semibold text-text-primary mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex justify-between gap-4">
            <span className="text-text-muted">{p.name}</span>
            <span className="font-mono text-text-primary">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-full bg-surface-950">
      <TopBar title="Análisis de Tendencias" subtitle="Evolución temporal del rendimiento" />

      <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title={t.kpi.totalSimulations}
            value={fmtNumber(kpis.totalSimulations)}
            icon={Activity}
            accent="blue"
            index={0}
            loading={isLoading}
          />
          <KPICard
            title="Períodos Analizados"
            value={fmtNumber(monthlyTrend.length)}
            subtitle="meses con actividad"
            icon={Calendar}
            accent="violet"
            index={1}
            loading={isLoading}
          />
          <KPICard
            title={t.kpi.avgScore}
            value={`${kpis.averageScore.toFixed(0)}%`}
            delta={kpis.trend.scoreDelta}
            trend={kpis.trend.scoreDelta >= 0 ? "up" : "down"}
            icon={TrendingUp}
            accent="emerald"
            index={2}
            loading={isLoading}
          />
          <KPICard
            title={t.kpi.passRate}
            value={fmtPercent(kpis.passRate)}
            delta={kpis.trend.passRateDelta}
            trend={kpis.trend.passRateDelta >= 0 ? "up" : "down"}
            icon={BarChart3}
            accent="cyan"
            index={3}
            loading={isLoading}
          />
        </div>

        {/* Granularity toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Granularidad:</span>
          {(["monthly", "weekly"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg border transition-all",
                granularity === g
                  ? "bg-brand-500/12 border-brand-500/50 text-brand-400"
                  : "border-border text-text-muted hover:border-border-strong"
              )}
            >
              {g === "monthly" ? "Mensual" : "Semanal"}
            </button>
          ))}
        </div>

        {/* Main trend chart */}
        <ScoreTrendChart data={trendData} loading={isLoading} />

        {/* Volume bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-5 border border-border"
        >
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-text-primary">Volumen de Simulaciones</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Cantidad de simulaciones y usuarios únicos por período
            </p>
          </div>
          {trendData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-text-muted text-sm">
              Sin datos para el período seleccionado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#6b6f8e", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#6b6f8e", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<VolumeTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "#a8aac8", paddingTop: 8 }}
                  formatter={(v) =>
                    v === "simulations" ? "Simulaciones" : "Usuarios únicos"
                  }
                />
                <Bar
                  dataKey="simulations"
                  name="simulations"
                  fill="#6366f1"
                  fillOpacity={0.75}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="uniqueUsers"
                  name="uniqueUsers"
                  fill="#8b5cf6"
                  fillOpacity={0.65}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Heatmap — only show if there's data */}
        {heatmap.some((c) => c.count > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-5 border border-border"
          >
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-text-primary">
                Mapa de Calor de Actividad
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Distribución de simulaciones por día y hora
              </p>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                <div className="flex flex-col pt-6 gap-0.5">
                  {HOURS.map((h) => (
                    <div key={h} className="h-7 flex items-center justify-end pr-2">
                      <span className="text-[9px] text-text-disabled">{h}:00</span>
                    </div>
                  ))}
                </div>
                {DAYS.map((day) => (
                  <div key={day} className="flex flex-col gap-0.5">
                    <div className="h-6 flex items-center justify-center">
                      <span className="text-[9px] text-text-muted font-medium">{day}</span>
                    </div>
                    {HOURS.map((hour) => {
                      const cell = heatmap.find((c) => c.day === day && c.hour === hour);
                      return (
                        <div
                          key={hour}
                          className="w-10 h-7 rounded-sm transition-all cursor-default"
                          style={{ background: getHeatColor(cell?.count ?? 0) }}
                          title={
                            cell?.count
                              ? `${day} ${hour}:00 — ${cell.count} sims, ${cell.avgScore.toFixed(0)}% prom.`
                              : "Sin actividad"
                          }
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-[10px] text-text-muted">Menor</span>
              {[0, 0.25, 0.5, 0.75, 1].map((i) => (
                <div
                  key={i}
                  className="w-5 h-3.5 rounded-sm"
                  style={{ background: getHeatColor(i * maxHeatCount) }}
                />
              ))}
              <span className="text-[10px] text-text-muted">Mayor actividad</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
