"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { MessageSquare, BarChart3 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { InteractionFunnel } from "@/components/analytics/InteractionFunnel";
import { KPICard } from "@/components/analytics/KPICard";
import { useFilteredSimulations } from "@/hooks/useAnalyticsData";
import { computeInteractionKPIs, computeActivityKPIs } from "@/lib/analytics/kpiEngine";
import { fmtNumber } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";

const ACTIVE_ROUNDS = [1, 2, 3, 4, 5];

function RadarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-border rounded-lg p-2 text-xs shadow-xl">
      <p className="text-text-primary font-semibold">{payload[0]?.payload?.subject}</p>
      <p className="text-brand-400">{(payload[0]?.value ?? 0).toFixed(0)}%</p>
    </div>
  );
}

export default function ConversationalPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { t } = useI18n();

  const interactionKPIs = useMemo(() => computeInteractionKPIs(simulations), [simulations]);
  const activityKPIs    = useMemo(() => computeActivityKPIs(simulations),    [simulations]);

  const bestRound  = interactionKPIs.length ? interactionKPIs.reduce((a, b) => a.passRate > b.passRate ? a : b) : null;
  const worstRound = interactionKPIs.length ? interactionKPIs.reduce((a, b) => a.passRate < b.passRate ? a : b) : null;

  const radarData = useMemo(
    () => interactionKPIs.filter((i) => i.roundIndex <= 5).map((i) => ({
      subject: `Int. ${i.roundIndex}`,
      value: i.passRate * 100,
      fullMark: 100,
    })),
    [interactionKPIs]
  );

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
      <TopBar title={t.nav.conversational} subtitle={t.scope.organization} />

      <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard
            title={t.kpi.totalSimulations}
            value={fmtNumber(simulations.length)}
            icon={MessageSquare}
            accent="brand"
            index={0}
            loading={isLoading}
          />
          <KPICard
            title={t.charts.interactionFunnel}
            value={fmtNumber(simulations.reduce((acc, s) => acc + s.rounds.slice(0, 5).filter((r) => r.score === 1).length, 0))}
            subtitle={`${fmtNumber(simulations.length * 5)} ${t.scope.participants.toLowerCase()}`}
            icon={MessageSquare}
            accent="emerald"
            index={1}
            loading={isLoading}
          />
          <KPICard
            title={bestRound ? `Int. ${bestRound.roundIndex}` : "—"}
            value={bestRound ? `${(bestRound.passRate * 100).toFixed(0)}%` : "—"}
            subtitle={bestRound ? `${t.charts.interactionFunnel}` : ""}
            icon={BarChart3}
            accent="cyan"
            index={2}
            loading={isLoading}
          />
          <KPICard
            title={worstRound ? `Int. ${worstRound.roundIndex}` : "—"}
            value={worstRound ? `${(worstRound.passRate * 100).toFixed(0)}%` : "—"}
            subtitle={worstRound ? `${t.ai.coaching}` : ""}
            icon={BarChart3}
            accent="rose"
            index={3}
            loading={isLoading}
          />
        </div>

        {/* Funnel + Radar */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <InteractionFunnel data={interactionKPIs} loading={isLoading} />
          <div className="rounded-2xl border border-border bg-surface-900/60 p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-1">{t.nav.conversational}</h3>
            <p className="text-xs text-text-muted mb-5">Int. 1–5</p>
            {radarData.length >= 3 ? (
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData} margin={{ top: 4, right: 20, bottom: 4, left: 20 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b6f8e", fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#6b6f8e", fontSize: 9 }} tickCount={4} />
                  <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.12} strokeWidth={2} />
                  <Tooltip content={<RadarTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-text-muted text-sm">{t.common.noData}</div>
            )}
          </div>
        </div>

        {/* Interaction matrix */}
        <div className="rounded-2xl border border-border bg-surface-900/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">{t.charts.activityBreakdown}</h3>
            <p className="text-xs text-text-muted mt-0.5">Int. 1–5</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-[10px] uppercase tracking-widest text-text-muted font-semibold">{t.table.activity}</th>
                  {ACTIVE_ROUNDS.map((i) => (
                    <th key={i} className="px-3 py-3 text-center text-[10px] uppercase tracking-widest text-text-muted font-semibold">Int. {i}</th>
                  ))}
                  <th className="px-5 py-3 text-right text-[10px] uppercase tracking-widest text-text-muted font-semibold">{t.kpi.totalSimulations}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="skeleton h-3 w-12 rounded mx-auto" /></td>
                      ))}
                    </tr>
                  ))
                ) : (
                  activityInteractions.map((a) => (
                    <motion.tr key={a.activityId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border last:border-0 hover:bg-surface-800/30 transition-colors">
                      <td className="px-5 py-3"><span className="text-xs font-medium text-text-primary max-w-[200px] truncate block" title={a.activityName}>{a.activityName}</span></td>
                      {a.rounds.map((r) => (
                        <td key={r.roundIndex} className="px-3 py-3 text-center">
                          {r.passRate === null || r.applicable === 0 ? (
                            <span className="text-[10px] text-text-disabled">N/A</span>
                          ) : (
                            <span
                              className="inline-flex items-center justify-center w-12 h-6 rounded-md text-[10px] font-bold"
                              style={{
                                background: r.passRate >= 0.8 ? "rgba(16,185,129,0.1)" : r.passRate >= 0.6 ? "rgba(99,102,241,0.1)" : r.passRate >= 0.4 ? "rgba(245,158,11,0.1)" : "rgba(244,63,94,0.1)",
                                color: r.passRate >= 0.8 ? "#34d399" : r.passRate >= 0.6 ? "#818cf8" : r.passRate >= 0.4 ? "#fbbf24" : "#fb7185",
                              }}
                            >
                              {(r.passRate * 100).toFixed(0)}%
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="px-5 py-3 text-right"><span className="text-xs font-mono text-text-muted">{a.simulationCount}</span></td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
