"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";
import type { TrendDataPoint } from "@/types/analytics";

interface ScoreTrendChartProps {
  data: TrendDataPoint[];
  loading?: boolean;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-700 border border-border rounded-xl p-3 shadow-xl min-w-[180px]">
      <p className="text-xs font-semibold text-text-primary mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-text-secondary">{p.name}</span>
          </div>
          <span className="font-mono font-semibold text-text-primary">
            {p.dataKey === "passRate" ? `${(p.value * 100).toFixed(0)}%` :
             p.dataKey === "averageScore" ? `${p.value.toFixed(0)}%` :
             p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ScoreTrendChart({ data, loading }: ScoreTrendChartProps) {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5 h-[320px]">
        <div className="skeleton-shimmer h-4 w-40 rounded mb-4" />
        <div className="skeleton-shimmer rounded-xl h-[240px]" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="glass-card rounded-2xl p-5 h-[320px] flex items-center justify-center">
        <p className="text-text-muted text-sm">Sin datos para el período seleccionado</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Tendencia de Rendimiento</h3>
          <p className="text-xs text-text-muted mt-0.5">Puntaje promedio y tasa de aprobación por período</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#94a3b8", paddingTop: 8 }}
            formatter={(v) => v === "averageScore" ? "Puntaje promedio" : "Tasa aprobación"}
          />
          <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} />
          <Area
            type="monotone"
            dataKey="averageScore"
            name="averageScore"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#scoreGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6" }}
          />
          <Area
            type="monotone"
            dataKey={(d) => d.passRate * 100}
            name="passRate"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#passGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#10b981" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
