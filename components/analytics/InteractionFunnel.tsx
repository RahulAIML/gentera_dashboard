"use client";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import type { InteractionKPI } from "@/types/analytics";

interface Props { data: InteractionKPI[]; loading?: boolean; }

function getColor(r: number): { bar: string; text: string; bg: string } {
  if (r >= 0.8) return { bar: "#10b981", text: "text-emerald-400", bg: "bg-emerald-500/10" };
  if (r >= 0.6) return { bar: "#f59e0b", text: "text-brand-400",   bg: "bg-brand-500/10"  };
  if (r >= 0.4) return { bar: "#0ea5e9", text: "text-blue-400",    bg: "bg-blue-500/10"   };
  return          { bar: "#f43f5e", text: "text-coral-400",  bg: "bg-coral-500/10"  };
}

export function InteractionFunnel({ data, loading }: Props) {
  const applicable = data.filter((d) => d.totalApplicable > 0);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-5 h-[300px]">
        <div className="skeleton h-4 w-52 rounded mb-2" />
        <div className="skeleton h-3 w-72 rounded mb-6" />
        {[1,2,3,4,5].map((i) => <div key={i} className="skeleton h-10 rounded-xl mb-2" />)}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Rendimiento por Interacción</h3>
          <p className="text-[11px] text-text-muted mt-0.5">Tasa de aprobación en cada ronda conversacional</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-blue-400" />
        </div>
      </div>

      <div className="space-y-2.5">
        {applicable.map((d, i) => {
          const colors = getColor(d.passRate);
          return (
            <motion.div
              key={d.roundIndex}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 + 0.1 }}
              className="group"
            >
              <div className="flex items-center gap-3">
                {/* Round label */}
                <div className={`w-7 h-7 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                  <span className={`text-[10px] font-black ${colors.text}`}>{d.roundIndex}</span>
                </div>

                {/* Bar track */}
                <div className="flex-1 bg-surface-700 rounded-full h-7 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.passRate * 100}%` }}
                    transition={{ duration: 0.7, delay: i * 0.08 + 0.25, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 rounded-full flex items-center justify-start pl-3"
                    style={{ background: `linear-gradient(90deg, ${colors.bar}cc, ${colors.bar})` }}
                  >
                    <span className="text-[11px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {(d.passRate * 100).toFixed(0)}%
                    </span>
                  </motion.div>
                  <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                    <span className="text-[11px] text-text-muted">Interacción {d.roundIndex}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="shrink-0 text-right min-w-[64px]">
                  <div className={`text-xs font-black tabular-nums ${colors.text}`}>
                    {(d.passRate * 100).toFixed(0)}%
                  </div>
                  <div className="text-[9px] text-text-disabled">
                    {d.totalPassed}/{d.totalApplicable}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border">
        {[
          { c: "#10b981", l: "≥80% excelente" },
          { c: "#f59e0b", l: "60–79% bueno" },
          { c: "#0ea5e9", l: "40–59% regular" },
          { c: "#f43f5e", l: "<40% crítico" },
        ].map((item) => (
          <div key={item.l} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: item.c }} />
            <span className="text-[10px] text-text-muted">{item.l}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
