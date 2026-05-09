"use client";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { InteractionKPI } from "@/types/analytics";
import { cn } from "@/lib/utils/cn";

interface InteractionFunnelProps {
  data: InteractionKPI[];
  loading?: boolean;
}

function getColor(passRate: number) {
  if (passRate >= 0.8) return "#10b981";
  if (passRate >= 0.6) return "#3b82f6";
  if (passRate >= 0.4) return "#f59e0b";
  return "#ef4444";
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as InteractionKPI;
  return (
    <div className="bg-surface-700 border border-border rounded-xl p-3 shadow-xl min-w-[180px]">
      <p className="text-xs font-semibold text-text-primary mb-2">{d.label}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Tasa aprobación</span>
          <span className="font-mono text-emerald-400">{(d.passRate * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Aprobados</span>
          <span className="font-mono text-text-primary">{d.totalPassed}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Total aplicable</span>
          <span className="font-mono text-text-primary">{d.totalApplicable}</span>
        </div>
      </div>
    </div>
  );
}

export function InteractionFunnel({ data, loading }: InteractionFunnelProps) {
  const applicable = data.filter((d) => d.totalApplicable > 0);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5 h-[280px]">
        <div className="skeleton-shimmer h-4 w-48 rounded mb-4" />
        <div className="skeleton-shimmer rounded-xl h-[200px]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-text-primary">Rendimiento por Interacción</h3>
        <p className="text-xs text-text-muted mt-0.5">Tasa de aprobación en cada ronda conversacional</p>
      </div>

      {/* Visual bars with labels */}
      <div className="space-y-2.5">
        {applicable.map((d, i) => (
          <motion.div
            key={d.roundIndex}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 + 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="w-20 shrink-0 text-xs text-text-secondary font-medium">{d.label}</div>
            <div className="flex-1 bg-surface-600 rounded-full h-6 overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${d.passRate * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.07 + 0.2, ease: "easeOut" }}
                className="h-full rounded-full flex items-center"
                style={{ background: getColor(d.passRate) }}
              />
              <div className="absolute inset-0 flex items-center px-2.5">
                <span className="text-[11px] font-semibold text-white mix-blend-difference">
                  {(d.passRate * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="w-20 shrink-0 text-right text-xs text-text-muted">
              {d.totalPassed}/{d.totalApplicable}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
        {[
          { color: "#10b981", label: "≥80% excelente" },
          { color: "#3b82f6", label: "60–79% bueno" },
          { color: "#f59e0b", label: "40–59% mejorable" },
          { color: "#ef4444", label: "<40% crítico" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: l.color }} />
            <span className="text-[10px] text-text-muted">{l.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
