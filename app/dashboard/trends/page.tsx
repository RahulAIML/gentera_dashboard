"use client";
import { useMemo, useState } from "react";
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

const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_INDICES = [0, 1, 2, 3, 4, 5, 6];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);

export default function TrendsPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { t, locale } = useI18n();
  const [granularity, setGranularity] = useState<"monthly" | "weekly">("monthly");
  const DAYS = locale === "es" ? DAYS_ES : DAYS_EN;

  const kpis         = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  const monthlyTrend = useMemo(() => computeMonthlyTrend(simulations),   [simulations]);
  const weeklyTrend  = useMemo(() => computeWeeklyTrend(simulations),    [simulations]);
  const heatmap      = useMemo(() => computeHeatmap(simulations),         [simulations]);

  const trendData   = granularity === "monthly" ? monthlyTrend : weeklyTrend;
  const maxHeatCount = Math.max(...heatmap.map((h) => h.count), 1);

  function getHeatColor(count: number) {
    const intensity = count / maxHeatCount;
    if (intensity === 0)  return "rgba(30,33,56,0.6)";
    if (intensity < 0.25) return "rgba(99,102,241,0.15)";
    if (intensity < 0.5)  return "rgba(99,102,241,0.35)";
    if (intensity < 0.75) return "rgba(99,102,241,0.55)";
    return "rgba(99,102,241,0.8)";
  }

  function VolumeTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-surface-800 border border-border rounded-lg p-3 text-xs shadow-xl">
        <p className="font-semibold text-text-primary mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex justify-between gap-4">
            <span className="text-text-muted">{p.dataKey === "simulations" ? t.kpi.totalSimulations : t.kpi.uniqueUsers}</span>
            <span className="font-mono text-text-primary">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-full bg-surface-950">
      <TopBar title={t.nav.trends} subtitle={t.scope.organization} />

      <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title={t.kpi.totalSimulations} value={fmtNumber(kpis.totalSimulations)} icon={Activity} accent="brand" index={0} loading={isLoading} />
          <KPICard title={t.kpi.activeDays} value={fmtNumber(monthlyTrend.length)} icon={Calendar} accent="violet" index={1} loading={isLoading} />
          <KPICard title={t.kpi.avgScore} value={`${kpis.averageScore.toFixed(0)}%`} delta={kpis.trend.scoreDelta} trend={kpis.trend.scoreDelta >= 0 ? "up" : "down"} icon={TrendingUp} accent="emerald" index={2} loading={isLoading} />
          <KPICard title={t.kpi.passRate} value={fmtPercent(kpis.passRate)} delta={kpis.trend.passRateDelta} trend={kpis.trend.passRateDelta >= 0 ? "up" : "down"} icon={BarChart3} accent="cyan" index={3} loading={isLoading} />
        </div>

        {/* Main Content: Trend Chart */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {(["monthly", "weekly"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg border transition-all",
                  granularity === g
                    ? "bg-brand-500/10 border-brand-500/40 text-brand-400"
                    : "border-border text-text-muted hover:border-border-strong"
                )}
              >
                {g === "monthly" ? t.filters.monthly : t.filters.weekly}
              </button>
            ))}
          </div>
          <ScoreTrendChart data={trendData} loading={isLoading} />
        </div>

        {/* Secondary Insight: Activity Heatmap */}
        {heatmap.some((c) => c.count > 0) && (
          <div className="rounded-2xl border border-border bg-surface-900/60 p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-1">{t.charts.activityBreakdown}</h3>
            <p className="text-xs text-text-muted mb-5">{t.charts.simAbbrev} distribution by day and hour</p>
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                <div className="flex flex-col pt-6 gap-0.5">
                  {HOURS.map((h) => (
                    <div key={h} className="h-7 flex items-center justify-end pr-2">
                      <span className="text-[9px] text-text-disabled">{h}:00</span>
                    </div>
                  ))}
                </div>
                {DAY_INDICES.map((dayIdx) => (
                  <div key={dayIdx} className="flex flex-col gap-0.5">
                    <div className="h-6 flex items-center justify-center">
                      <span className="text-[9px] text-text-muted font-medium">{DAYS[dayIdx]}</span>
                    </div>
                    {HOURS.map((hour) => {
                      const cell = heatmap.find((c) => c.day === dayIdx && c.hour === hour);
                      return (
                        <div
                          key={hour}
                          className="w-10 h-7 rounded-sm"
                          style={{ background: getHeatColor(cell?.count ?? 0) }}
                          title={cell?.count ? `${DAYS[dayIdx]} ${hour}:00 — ${cell.count} ${t.charts.simAbbrev}` : "—"}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
