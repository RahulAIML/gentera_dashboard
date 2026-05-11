"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, BarChart3 } from "lucide-react";
import { PageShell, PageSection, PageEmpty } from "@/components/layout/PageShell";
import { PageActions } from "@/components/layout/PageActions";
import { FilterBar } from "@/components/layout/FilterBar";
import { InteractionFunnel } from "@/components/analytics/InteractionFunnel";
import { KPICard } from "@/components/analytics/KPICard";
import { useFilteredSimulations } from "@/hooks/useAnalyticsData";
import { computeInteractionKPIsLocalized, computeActivityKPIs } from "@/lib/analytics/kpiEngine";
import { fmtNumber, fmtPercent } from "@/lib/utils/formatters";
import { useI18n } from "@/lib/i18n";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";
import type { TooltipContentProps } from "recharts";

const ACTIVE_ROUNDS = [1, 2, 3, 4, 5];

type RadarTooltipProps = TooltipContentProps<number, string>;

function RadarTooltip({ active, payload }: RadarTooltipProps) {
  if (!active || !payload?.length) return null;
  const first = payload[0];
  const p = first?.payload;
  const subject =
    p && typeof p === "object" && "subject" in p && typeof (p as { subject?: unknown }).subject === "string"
      ? (p as { subject: string }).subject
      : "";
  const rawValue = first?.value;
  const value = typeof rawValue === "number" ? rawValue : Number(rawValue ?? 0);
  return (
    <div className="bg-surface-800 border border-border rounded-lg p-2 text-xs shadow-xl">
      <p className="text-text-primary font-semibold">{subject}</p>
      <p className="text-brand-400">{value.toFixed(0)}%</p>
    </div>
  );
}

export default function ConversationalPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { t, locale } = useI18n();
  const [showAllActivities, setShowAllActivities] = useState(false);

  const interactionKPIs = useMemo(() => computeInteractionKPIsLocalized(simulations, locale), [simulations, locale]);
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

  const overallInteractionPassRate = useMemo(() => {
    const applicable = simulations.flatMap((s) => s.rounds.slice(0, 5)).filter((r) => r.applicable);
    if (!applicable.length) return 0;
    const passed = applicable.filter((r) => r.score === 1).length;
    return passed / applicable.length;
  }, [simulations]);

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
    <PageShell
      title={t.nav.conversational}
      subtitle={t.scope.organization}
      actions={<PageActions />}
      filters={<FilterBar />}
    >
      <PageSection variant="bare">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard title={t.kpi.totalSimulations} value={fmtNumber(simulations.length, locale)} icon={MessageSquare} accent="brand" index={0} loading={isLoading} />
          <KPICard title={t.charts.interactionFunnel} value={fmtPercent(overallInteractionPassRate)} icon={MessageSquare} accent="emerald" index={1} loading={isLoading} />
          <KPICard title={bestRound ? bestRound.label : "—"} value={bestRound ? fmtPercent(bestRound.passRate) : "—"} icon={BarChart3} accent="cyan" index={2} loading={isLoading} />
          <KPICard title={worstRound ? worstRound.label : "—"} value={worstRound ? fmtPercent(worstRound.passRate) : "—"} icon={BarChart3} accent="rose" index={3} loading={isLoading} />
        </div>
      </PageSection>

      <InteractionFunnel data={interactionKPIs} loading={isLoading} />

      {/* Secondary (progressive disclosure): round radar */}
      <details className="rounded-2xl border border-border bg-surface-900/60 overflow-hidden">
        <summary className="px-5 py-4 cursor-pointer select-none text-[13px] font-semibold text-text-primary">
          {t.nav.conversational} · Int. 1–5
        </summary>
        <div className="px-5 pb-5">
          {radarData.length >= 3 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b6f8e", fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#6b6f8e", fontSize: 9 }} tickCount={4} />
                <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.12} strokeWidth={2} />
                <Tooltip content={(props) => <RadarTooltip {...(props as any)} />} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <PageEmpty />
          )}
        </div>
      </details>

      {/* Drill-down: activity matrix */}
      <details className="rounded-2xl border border-border bg-surface-900/60 overflow-hidden">
        <summary className="px-5 py-4 cursor-pointer select-none text-[13px] font-semibold text-text-primary">
          {t.charts.activityBreakdown} · Int. 1–5
          <span className="ml-2 text-[12px] font-normal text-text-muted">
            ({fmtNumber(activityInteractions.length, locale)} {t.kpi.totalActivities.toLowerCase()})
          </span>
        </summary>
        <div className="px-5 pb-5">
          {!showAllActivities && activityInteractions.length > 10 && (
            <button
              onClick={() => setShowAllActivities(true)}
              className="mb-4 text-[12px] font-medium text-brand-300 hover:text-brand-200"
            >
              {t.charts.moreItems} · {activityInteractions.length - 10}
            </button>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-text-muted font-semibold">{t.table.activity}</th>
                  {ACTIVE_ROUNDS.map((i) => (
                    <th key={i} className="px-3 py-3 text-center text-[10px] uppercase tracking-widest text-text-muted font-semibold">Int. {i}</th>
                  ))}
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-text-muted font-semibold">{t.kpi.totalSimulations}</th>
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
                  (showAllActivities ? activityInteractions : activityInteractions.slice(0, 10)).map((a) => (
                    <motion.tr key={a.activityId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border last:border-0 hover:bg-surface-800/30 transition-colors">
                      <td className="px-4 py-3"><span className="text-xs font-medium text-text-primary max-w-[260px] truncate block" title={a.activityName}>{a.activityName}</span></td>
                      {a.rounds.map((r) => (
                        <td key={r.roundIndex} className="px-3 py-3 text-center">
                          {r.passRate === null || r.applicable === 0 ? (
                            <span className="text-[10px] text-text-disabled">—</span>
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
                      <td className="px-4 py-3 text-right"><span className="text-xs font-mono text-text-muted">{a.simulationCount}</span></td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </PageShell>
  );
}
