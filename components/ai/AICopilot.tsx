"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, X, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, Brain, Zap, Info,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useFilteredSimulations } from "@/hooks/useAnalyticsData";
import {
  computeKPISummary,
  computeInteractionKPIs,
  computeActivityKPIs,
  computeUserKPIs,
} from "@/lib/analytics/kpiEngine";
import { useI18n } from "@/lib/i18n";
import { fmtPercent } from "@/lib/utils/formatters";
import type { AIInsight } from "@/types/analytics";
import type { Dict } from "@/lib/i18n/locales/es";

function severityIcon(severity: AIInsight["severity"]) {
  switch (severity) {
    case "critical": return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    case "warning":  return <TrendingDown  className="w-4 h-4 text-amber-400" />;
    case "success":  return <CheckCircle  className="w-4 h-4 text-emerald-400" />;
    default:         return <Info         className="w-4 h-4 text-brand-400" />;
  }
}

function severityBorder(severity: AIInsight["severity"]) {
  switch (severity) {
    case "critical": return "border-rose-500/20 bg-rose-500/4";
    case "warning":  return "border-amber-500/20 bg-amber-500/4";
    case "success":  return "border-emerald-500/20 bg-emerald-500/4";
    default:         return "border-brand-500/20 bg-brand-500/4";
  }
}

function buildInsights(
  sims: ReturnType<typeof Array.prototype.filter>,
  interactionKPIs: ReturnType<typeof computeInteractionKPIs>,
  activityKPIs: ReturnType<typeof computeActivityKPIs>,
  userKPIs: ReturnType<typeof computeUserKPIs>,
  t: Dict,
): AIInsight[] {
  if (!sims.length) return [];
  const insights: AIInsight[] = [];

  // 1. Performance overview
  const kpis = computeKPISummary(sims as any, []);
  const statusText = kpis.passRate < 0.5 ? t.ai.belowMin : kpis.passRate < 0.7 ? t.ai.withinRange : t.ai.optimal;
  insights.push({
    id: "perf-overview",
    type: "trend",
    severity: kpis.passRate < 0.5 ? "critical" : kpis.passRate < 0.7 ? "warning" : "success",
    title: t.ai.perfSummary,
    description: `${t.charts.passRateLabel}: ${fmtPercent(kpis.passRate, 0)} | ${t.charts.avgScoreLabel}: ${kpis.averageScore.toFixed(1)}% — ${statusText}`,
    metric: fmtPercent(kpis.passRate, 0),
  });

  // 2. Best-performing activity
  if (activityKPIs.length) {
    const best = activityKPIs.reduce((a, b) => a.passRate > b.passRate ? a : b);
    const name = best.activityName.length > 28 ? best.activityName.slice(0, 28) + "…" : best.activityName;
    insights.push({
      id: "best-activity",
      type: "achievement",
      severity: "success",
      title: `${t.ai.bestActivity}: ${name}`,
      description: `${fmtPercent(best.passRate, 0)} ${t.charts.passRateLabel.toLowerCase()} — ${best.averageScore.toFixed(1)}% avg — ${best.simulationCount} ${t.charts.simAbbrev}`,
      metric: fmtPercent(best.passRate, 0),
      relatedEntity: best.activityName,
    });
  }

  // 3. Worst-performing activity
  if (activityKPIs.length) {
    const worst = activityKPIs.reduce((a, b) => a.passRate < b.passRate ? a : b);
    if (worst.passRate < 0.5) {
      const name = worst.activityName.length > 28 ? worst.activityName.slice(0, 28) + "…" : worst.activityName;
      insights.push({
        id: "worst-activity",
        type: "risk",
        severity: worst.passRate < 0.3 ? "critical" : "warning",
        title: `${t.ai.criticalActivity}: ${name}`,
        description: `${fmtPercent(worst.passRate, 0)} ${t.charts.passRateLabel.toLowerCase()} — ${worst.simulationCount} ${t.charts.simAbbrev}`,
        metric: fmtPercent(worst.passRate, 0),
        relatedEntity: worst.activityName,
      });
    }
  }

  // 4. Hardest interaction (from rounds 1–5 only)
  const applicableRounds = interactionKPIs.filter((r) => r.roundIndex <= 5 && r.totalApplicable > 0);
  if (applicableRounds.length) {
    const hardest = applicableRounds.reduce((a, b) => a.passRate < b.passRate ? a : b);
    insights.push({
      id: "hardest-round",
      type: "risk",
      severity: hardest.passRate < 0.3 ? "critical" : "warning",
      title: `${hardest.label} ${t.ai.hardestRound}`,
      description: `${fmtPercent(hardest.passRate, 0)} — ${hardest.totalApplicable} ${t.charts.simulationsLabel.toLowerCase()}`,
      metric: fmtPercent(hardest.passRate, 0),
      relatedEntity: hardest.label,
    });
  }

  // 5. Monthly trend
  const byMonth = new Map<string, number[]>();
  for (const s of sims as any[]) {
    if (!byMonth.has(s.monthKey)) byMonth.set(s.monthKey, []);
    byMonth.get(s.monthKey)!.push(s.score);
  }
  const months = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b));
  if (months.length >= 2) {
    const last  = months[months.length - 1];
    const prev  = months[months.length - 2];
    const lastAvg = last[1].reduce((a: number, b: number) => a + b, 0) / last[1].length;
    const prevAvg = prev[1].reduce((a: number, b: number) => a + b, 0) / prev[1].length;
    const delta   = lastAvg - prevAvg;
    if (Math.abs(delta) > 3) {
      insights.push({
        id: "month-trend",
        type: "trend",
        severity: delta > 0 ? "success" : "warning",
        title: delta > 0 ? t.ai.monthTrendUp : t.ai.monthTrendDown,
        description: `${delta > 0 ? "+" : ""}${Math.abs(delta).toFixed(1)} pts ${t.ai.vsPrevious}`,
        metric: `${delta > 0 ? "+" : ""}${delta.toFixed(1)} pts`,
        delta,
      });
    }
  }

  // 6. Users needing coaching
  const needCoaching = userKPIs.filter((u) => (u as any).passRate < 0.5);
  if (needCoaching.length > 0) {
    insights.push({
      id: "coaching-needed",
      type: "risk",
      severity: needCoaching.length > 5 ? "critical" : "warning",
      title: `${needCoaching.length} ${t.ai.needsCoaching}`,
      description: `${needCoaching.length} ${t.ai.advisors} < 50% ${t.charts.passRateLabel.toLowerCase()}`,
      metric: `${needCoaching.length} ${t.ai.advisors}`,
    });
  }

  return insights.slice(0, 6);
}

export function AICopilot() {
  const [open, setOpen] = useState(false);
  const { simulations, isLoading } = useFilteredSimulations();
  const { t } = useI18n();

  const interactionKPIs = useMemo(() => computeInteractionKPIs(simulations), [simulations]);
  const activityKPIs    = useMemo(() => computeActivityKPIs(simulations),    [simulations]);
  const userKPIs        = useMemo(() => computeUserKPIs(simulations),         [simulations]);
  const insights        = useMemo(
    () => buildInsights(simulations, interactionKPIs, activityKPIs, userKPIs, t),
    [simulations, interactionKPIs, activityKPIs, userKPIs, t]
  );

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full",
          "bg-gradient-to-br from-brand-500 to-violet-600",
          "flex items-center justify-center shadow-lg shadow-brand-900/40",
          "border border-brand-400/30 transition-shadow",
          open && "hidden"
        )}
        title={t.ai.copilot}
        aria-label={t.ai.copilot}
      >
        <Sparkles className="w-5 h-5 text-white" />
        {insights.some((i) => i.severity === "critical") && (
          <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-rose-500 border-2 border-surface-900" />
        )}
      </motion.button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0,      opacity: 1 }}
              exit={{ x: "100%",    opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
              className="fixed top-0 right-0 h-full w-[400px] max-w-full z-50 flex flex-col bg-surface-900 border-l border-border shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-text-primary">{t.ai.copilot}</h2>
                    <p className="text-[10px] text-text-muted">{simulations.length} {t.ai.simsAnalyzed}</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg bg-surface-800 border border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                  aria-label={t.ai.close}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Context summary */}
              <div className="px-5 py-3 bg-surface-850 border-b border-border shrink-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3 h-3 text-brand-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-400">
                    {t.ai.activeContext}
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  {t.ai.analyzingSims} ({simulations.length})
                </p>
              </div>

              {/* Insights list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="skeleton h-20 rounded-xl" />
                    ))}
                  </div>
                ) : insights.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <Sparkles className="w-8 h-8 text-text-disabled mb-3" />
                    <p className="text-sm text-text-muted">{t.ai.noInsights}</p>
                  </div>
                ) : (
                  insights.map((insight, i) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={cn(
                        "rounded-xl p-4 border",
                        severityBorder(insight.severity)
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">{severityIcon(insight.severity)}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-xs font-semibold text-text-primary leading-snug">
                              {insight.title}
                            </h4>
                            {insight.metric && (
                              <span className="text-[10px] font-bold text-text-secondary shrink-0 tabular-nums">
                                {insight.metric}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-text-muted leading-relaxed">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-border shrink-0">
                <p className="text-[10px] text-text-disabled text-center">
                  {t.ai.autoGenerated}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
