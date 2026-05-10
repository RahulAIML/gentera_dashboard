"use client";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { ActivityKPI } from "@/types/analytics";
import { fmtPercent } from "@/lib/utils/formatters";

interface Props { data: ActivityKPI[]; loading?: boolean; metric?: "simulationCount" | "averageScore" | "passRate"; }

const PALETTE = ["#6366f1","#8b5cf6","#10b981","#60a5fa","#fb7185","#22d3ee","#34d399","#fbbf24","#a78bfa"];

function Tip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ActivityKPI & { color: string };
  return (
    <div className="bg-surface-750 border border-border-strong rounded-xl p-3.5 shadow-2xl max-w-[220px]">
      <p className="text-[11px] font-bold text-text-primary mb-2 leading-snug">{d.activityName}</p>
      <div className="space-y-1 text-xs">
        {[
          ["Simulaciones", d.simulationCount, "text-brand-400"],
          ["Puntaje prom.", `${d.averageScore.toFixed(0)}%`, "text-blue-400"],
          ["Aprobación",   fmtPercent(d.passRate), "text-emerald-400"],
          ["Usuarios",     d.uniqueUsers, "text-violet-400"],
        ].map(([label, val, cls]) => (
          <div key={String(label)} className="flex justify-between gap-3">
            <span className="text-text-muted">{label}</span>
            <span className={`font-mono font-bold ${cls}`}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityChart({ data, loading, metric = "simulationCount" }: Props) {
  if (loading) {
    return (
      <div className="glass rounded-2xl p-5 h-[300px]">
        <div className="skeleton h-4 w-40 rounded mb-2" />
        <div className="skeleton h-3 w-64 rounded mb-6" />
        <div className="skeleton rounded-xl h-[210px]" />
      </div>
    );
  }

  const chartData = data.map((d, i) => ({
    ...d,
    shortName: d.activityName.length > 22 ? d.activityName.slice(0, 22) + "…" : d.activityName,
    color: PALETTE[i % PALETTE.length],
    val: metric === "passRate" ? d.passRate * 100 : d[metric as "simulationCount" | "averageScore"],
  }));

  const labels: Record<string, string> = {
    simulationCount: "Simulaciones por actividad",
    averageScore:    "Puntaje promedio (%)",
    passRate:        "Tasa de aprobación (%)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass rounded-2xl p-5"
    >
      <div className="mb-5">
        <h3 className="text-sm font-bold text-text-primary">Uso por Actividad</h3>
        <p className="text-[11px] text-text-muted mt-0.5">{labels[metric]} por caso de uso</p>
      </div>
      <ResponsiveContainer width="100%" height={228}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 24, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#6b6f8e", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="shortName" tick={{ fill: "#a8aac8", fontSize: 10 }} axisLine={false} tickLine={false} width={144} />
          <Tooltip content={<Tip />} />
          <Bar dataKey="val" radius={[0, 6, 6, 0]} maxBarSize={26}>
            {chartData.map((e, i) => (
              <Cell key={i} fill={e.color} fillOpacity={0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
