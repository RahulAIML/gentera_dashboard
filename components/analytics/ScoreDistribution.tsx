"use client";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { ScoreDistributionBucket } from "@/types/analytics";

const BUCKET_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#3b82f6", "#10b981"];

interface ScoreDistributionProps {
  data: ScoreDistributionBucket[];
  loading?: boolean;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ScoreDistributionBucket;
  return (
    <div className="bg-surface-700 border border-border rounded-xl p-3 shadow-xl">
      <p className="text-xs font-semibold text-text-primary mb-1.5">Rango: {d.range}</p>
      <div className="flex justify-between gap-4 text-xs">
        <span className="text-text-muted">Simulaciones</span>
        <span className="font-mono text-text-primary">{d.count}</span>
      </div>
      <div className="flex justify-between gap-4 text-xs">
        <span className="text-text-muted">Porcentaje</span>
        <span className="font-mono text-brand-400">{(d.percentage * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}

export function ScoreDistribution({ data, loading }: ScoreDistributionProps) {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5 h-[240px]">
        <div className="skeleton-shimmer h-4 w-36 rounded mb-4" />
        <div className="skeleton-shimmer rounded-xl h-[160px]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-text-primary">Distribución de Puntajes</h3>
        <p className="text-xs text-text-muted mt-0.5">Frecuencia por rango de calificación</p>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="range"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={BUCKET_COLORS[i]} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
