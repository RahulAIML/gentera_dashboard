"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { MessageSquare, BarChart3 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { InteractionFunnel } from "@/components/analytics/InteractionFunnel";
import { KPICard } from "@/components/analytics/KPICard";
import { useFilteredSimulations } from "@/hooks/useAnalyticsData";
import {
  computeInteractionKPIs,
  computeActivityKPIs,
  computeKPISummary,
} from "@/lib/analytics/kpiEngine";
import { fmtNumber, fmtPercent } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";

// Only show rounds 1-5; round 6 is always "No aplica" and excluded by computeInteractionKPIs
const ACTIVE_ROUNDS = [1, 2, 3, 4, 5];

function RadarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-700 border border-border rounded-xl p-2 text-xs shadow-xl">
      <p className="text-text-primary font-semibold">{payload[0]?.payload?.subject}</p>
      <p className="text-brand-400">{(payload[0]?.value ?? 0).toFixed(0)}% aprobación</p>
    </div>
  );
}

export default function ConversationalPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { t } = useI18n();

  const kpis            = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  // computeInteractionKPIs already filters out Round 6 (zero applicable)
  const interactionKPIs = useMemo(() => computeInteractionKPIs(simulations), [simulations]);
  const activityKPIs    = useMemo(() => computeActivityKPIs(simulations),    [simulations]);

  const radarData = useMemo(
    () =>
      interactionKPIs
        .filter((i) => i.roundIndex <= 5)
        .map((i) => ({
          subject: `Int. ${i.roundIndex}`,
          value: i.passRate * 100,
          fullMark: 100,
        })),
    [interactionKPIs]
  );

  // Per-activity interaction breakdown — only rounds 1–5
  const activityInteractions = useMemo(() => {
    return activityKPIs.map((a) => {
      const actSims = simulations.filter((s) => s.activityId === a.activityId);
      const rounds = ACTIVE_ROUNDS.map((i) => {
        const applicable = actSims.filter((s) => s.rounds[i - 1]?.applicable);
        const passed = applicable.filter((s) => s.rounds[i - 1]?.score === 1);
        return {
          roundIndex: i,
          passRate: applicable.length ? passed.length / applicable.length : null,
          applicable: applicable.length,
        };
      });
      return { ...a, rounds };
    });
  }, [simulations, activityKPIs]);

  return (
    <div className="min-h-full bg-surface-950">
      <TopBar title="Inteligencia Conversacional" subtitle="Análisis por interacción y ronda" />

      <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Rondas Aplicables"
            value={fmtNumber(simulations.length * ACTIVE_ROUNDS.length)}
            icon={MessageSquare}
            accent="violet"
            index={0}
            loading={isLoading}
          />
          <KPICard
            title="Interacciones Aprobadas"
            value={fmtNumber(
              simulations.reduce(
                (acc, s) => acc + s.rounds.slice(0, 5).filter((r) => r.score === 1).length,
                0
              )
            )}
            icon={MessageSquare}
            accent="emerald"
            index={1}
            loading={isLoading}
          />
          <KPICard
            title="Mejor Interacción"
            value={
              interactionKPIs.length
                ? `Int. ${interactionKPIs.reduce((a, b) => a.passRate > b.passRate ? a : b).roundIndex}`
                : "—"
            }
            icon={BarChart3}
            accent="cyan"
            index={2}
            loading={isLoading}
          />
          <KPICard
            title="Interacción Crítica"
            value={
              interactionKPIs.length
                ? `Int. ${interactionKPIs.reduce((a, b) => a.passRate < b.passRate ? a : b).roundIndex}`
                : "—"
            }
            icon={BarChart3}
            accent="rose"
            index={3}
            loading={isLoading}
          />
        </div>

        {/* Funnel + Radar */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <InteractionFunnel data={interactionKPIs} loading={isLoading} />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-5 border border-border"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Mapa de Competencias Conversacionales
            </h3>
            <p className="text-xs text-text-muted mb-5">
              Rendimiento relativo por interacción (rondas 1–5)
            </p>
            {radarData.length >= 3 ? (
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData} margin={{ top: 4, right: 20, bottom: 4, left: 20 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b6f8e", fontSize: 11 }} />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "#6b6f8e", fontSize: 9 }}
                    tickCount={4}
                  />
                  <Radar
                    name="Tasa aprobación"
                    dataKey="value"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Tooltip content={<RadarTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-text-muted text-sm">
                Datos insuficientes para el gráfico de radar
              </div>
            )}
          </motion.div>
        </div>

        {/* Per-activity interaction matrix — rounds 1–5 only */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl overflow-hidden border border-border"
        >
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">
              Matriz de Interacciones por Actividad
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Tasa de aprobación por ronda (1–5) y caso de uso
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-[10px] uppercase tracking-widest text-text-muted font-semibold">
                    Actividad
                  </th>
                  {ACTIVE_ROUNDS.map((i) => (
                    <th
                      key={i}
                      className="px-3 py-3 text-center text-[10px] uppercase tracking-widest text-text-muted font-semibold"
                    >
                      Int. {i}
                    </th>
                  ))}
                  <th className="px-5 py-3 text-right text-[10px] uppercase tracking-widest text-text-muted font-semibold">
                    Sims.
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="skeleton-shimmer h-3 w-12 rounded mx-auto" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : activityInteractions.map((a, i) => (
                      <motion.tr
                        key={a.activityId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-border last:border-0 hover:bg-surface-800/30 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div
                            className="text-xs font-medium text-text-primary max-w-[200px] truncate"
                            title={a.activityName}
                          >
                            {a.activityName}
                          </div>
                        </td>
                        {a.rounds.map((r) => (
                          <td key={r.roundIndex} className="px-3 py-3 text-center">
                            {r.passRate === null || r.applicable === 0 ? (
                              <span className="text-[10px] text-text-disabled">N/A</span>
                            ) : (
                              <div
                                className="inline-flex items-center justify-center w-12 h-6 rounded-md text-[10px] font-bold"
                                style={{
                                  background:
                                    r.passRate >= 0.8
                                      ? "rgba(16,185,129,0.12)"
                                      : r.passRate >= 0.6
                                      ? "rgba(99,102,241,0.12)"
                                      : r.passRate >= 0.4
                                      ? "rgba(245,158,11,0.12)"
                                      : "rgba(244,63,94,0.12)",
                                  color:
                                    r.passRate >= 0.8
                                      ? "#34d399"
                                      : r.passRate >= 0.6
                                      ? "#818cf8"
                                      : r.passRate >= 0.4
                                      ? "#fbbf24"
                                      : "#fb7185",
                                }}
                              >
                                {(r.passRate * 100).toFixed(0)}%
                              </div>
                            )}
                          </td>
                        ))}
                        <td className="px-5 py-3 text-right">
                          <span className="text-xs font-mono text-text-muted">
                            {a.simulationCount}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
