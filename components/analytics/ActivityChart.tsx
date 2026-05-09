"use client";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import type { ActivityKPI } from "@/types/analytics";
import { fmtPercent } from "@/lib/utils/formatters";

interface ActivityChartProps {
  data: ActivityKPI[];
  loading?: boolean;
  metric?: "simulationCount" | "averageScore" | "passRate";
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ActivityKPI;
  return (
    <div className="bg-surface-700 border border-border rounded-xl p-3 shadow-xl">
      <p className="text-xs font-semibold text-text-primary mb-2 max-w-[180px] leading-snug">{d.activityName}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Simulaciones</span>
          <span className="font-mono text-text-primary">{d.simulationCount}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Puntaje promedio</span>
          <span className="font-mono text-brand-400">{d.averageScore.toFixed(0)}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Tasa aprobación</span>
          <span className="font-mono text-emerald-400">{fmtPercent(d.passRate)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Usuarios únicos</span>
          <span className="font-mono text-text-primary">{d.uniqueUsers}</span>
        </div>
      </div>
    </div>
  );
}

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#84cc16", "#f97316"];

export function ActivityChart({ data, loading, metric = "simulationCount" }: ActivityChartProps) {
  const chartData = data.map((d, i) => ({
    ...d,
    shortName: d.activityName.length > 24 ? d.activityName.slice(0, 24) + "…" : d.activityName,
    color: COLORS[i % COLORS.length],
    displayValue: metric === "passRate" ? d.passRate * 100 : d[metric],
  }));

  const metricLabels = {
    simulationCount: "Simulaciones",
    averageScore: "Puntaje Promedio (%)",
    passRate: "Tasa Aprobación (%)",
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5 h-[300px]">
        <div className="skeleton-shimmer h-4 w-40 rounded mb-4" />
        <div className="skeleton-shimmer rounded-xl h-[220px]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-text-primary">Uso por Actividad</h3>
        <p className="text-xs text-text-muted mt-0.5">{metricLabels[metric]} por caso de uso</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={140}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="displayValue" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {chartData.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
