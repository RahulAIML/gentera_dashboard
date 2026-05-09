"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Brain, User, ChevronRight, Star, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { InsightsPanel } from "@/components/analytics/AIInsightCard";
import { KPICard } from "@/components/analytics/KPICard";
import { useFilteredSimulations } from "@/hooks/useAnalyticsData";
import {
  computeKPISummary,
  computeUserKPIs,
  computeInteractionKPIs,
  computeActivityKPIs,
} from "@/lib/analytics/kpiEngine";
import { generateInsights } from "@/lib/analytics/insightEngine";
import { fmtNumber, fmtPercent, fmtDateTime, initials } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { UserKPI } from "@/types/analytics";

function UserCoachingCard({ user, index, simulations }: { user: UserKPI; index: number; simulations: any[] }) {
  const userSims = simulations.filter((s) => s.userName === user.userName);
  const needsCoaching = user.averageScore < 60 || user.passRate < 0.5;
  const hasFeedback = userSims.some((s) =>
    s.rounds.some((r: any) => r.feedback !== null)
  );

  // Find their weakest interaction
  const roundScores = [1, 2, 3, 4, 5].map((i) => {
    const applicable = userSims.filter((s) => s.rounds[i - 1]?.applicable);
    const passed = applicable.filter((s) => s.rounds[i - 1]?.score === 1);
    return {
      round: i,
      passRate: applicable.length ? passed.length / applicable.length : null,
      applicable: applicable.length,
    };
  });
  const weakestRound = roundScores.filter((r) => r.passRate !== null && r.applicable > 0)
    .sort((a, b) => (a.passRate ?? 1) - (b.passRate ?? 1))[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "glass-card rounded-xl p-4 border transition-all hover:border-brand-500/30",
        needsCoaching ? "border-amber-500/20" : "border-border"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials(user.userName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-text-primary truncate">{user.userName}</span>
            {needsCoaching && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                Requiere coaching
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
            <span className="text-xs text-text-muted">{user.simulationCount} simulaciones</span>
            <span className={cn(
              "text-xs font-semibold",
              user.averageScore >= 70 ? "text-emerald-400" :
              user.averageScore >= 50 ? "text-amber-400" : "text-red-400"
            )}>
              {user.averageScore.toFixed(0)}% promedio
            </span>
            <span className="text-xs text-text-muted">{fmtPercent(user.passRate)} aprobación</span>
          </div>
        </div>
        <Link
          href={`/dashboard/leaderboard`}
          className="text-text-muted hover:text-brand-400 transition-colors shrink-0 mt-1"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Score progress bars */}
      <div className="mt-3 flex items-center gap-1.5">
        {roundScores.map((r) => (
          <div key={r.round} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-surface-600 rounded-full h-1.5 overflow-hidden">
              {r.passRate !== null ? (
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${r.passRate * 100}%`,
                    background: r.passRate >= 0.7 ? "#10b981" : r.passRate >= 0.5 ? "#f59e0b" : "#ef4444",
                  }}
                />
              ) : (
                <div className="h-full w-full bg-surface-500/50 rounded-full" />
              )}
            </div>
            <span className="text-[9px] text-text-disabled">I{r.round}</span>
          </div>
        ))}
      </div>

      {/* Coaching suggestion */}
      {weakestRound && weakestRound.passRate !== null && weakestRound.passRate < 0.7 && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <p className="text-[11px] text-amber-400">
            <span className="font-semibold">Foco de mejora:</span> Interacción {weakestRound.round} con {(weakestRound.passRate * 100).toFixed(0)}% aprobación
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function CoachingPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const [filter, setFilter] = useState<"all" | "coaching" | "top">("all");

  const userKPIs = useMemo(() => computeUserKPIs(simulations), [simulations]);
  const interactionKPIs = useMemo(() => computeInteractionKPIs(simulations), [simulations]);
  const activityKPIs = useMemo(() => computeActivityKPIs(simulations), [simulations]);
  const insights = useMemo(
    () => generateInsights(simulations, interactionKPIs, activityKPIs, userKPIs),
    [simulations, interactionKPIs, activityKPIs, userKPIs]
  );

  const needsCoaching = useMemo(
    () => userKPIs.filter((u) => u.averageScore < 60 || u.passRate < 0.5),
    [userKPIs]
  );
  const topPerformers = useMemo(
    () => userKPIs.filter((u) => u.averageScore >= 80 && u.passRate >= 0.7),
    [userKPIs]
  );

  const displayed = useMemo(() => {
    if (filter === "coaching") return needsCoaching;
    if (filter === "top") return topPerformers;
    return userKPIs;
  }, [filter, userKPIs, needsCoaching, topPerformers]);

  return (
    <div className="min-h-full bg-surface-900">
      <TopBar title="Coaching IA" subtitle="Diagnóstico personalizado por asesor" />

      <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Asesores Analizados"
            value={fmtNumber(userKPIs.length)}
            icon={User}
            accent="blue"
            index={0}
            loading={isLoading}
          />
          <KPICard
            title="Requieren Coaching"
            value={fmtNumber(needsCoaching.length)}
            subtitle={`${fmtPercent(userKPIs.length ? needsCoaching.length / userKPIs.length : 0)} del total`}
            icon={AlertTriangle}
            accent="amber"
            index={1}
            loading={isLoading}
          />
          <KPICard
            title="Alto Rendimiento"
            value={fmtNumber(topPerformers.length)}
            icon={Star}
            accent="emerald"
            index={2}
            loading={isLoading}
          />
          <KPICard
            title="Alertas IA"
            value={fmtNumber(insights.filter(i => i.severity === "critical" || i.severity === "warning").length)}
            icon={Brain}
            accent="violet"
            index={3}
            loading={isLoading}
          />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Insights panel */}
          <div className="xl:col-span-1">
            <InsightsPanel insights={insights} loading={isLoading} />
          </div>

          {/* User coaching cards */}
          <div className="xl:col-span-2 space-y-4">
            {/* Filter tabs */}
            <div className="flex items-center gap-2">
              {(["all", "coaching", "top"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg border transition-all",
                    filter === f
                      ? "bg-brand-500/20 border-brand-500 text-brand-400"
                      : "border-border text-text-muted hover:border-surface-300"
                  )}
                >
                  {f === "all" ? `Todos (${userKPIs.length})` :
                   f === "coaching" ? `Necesitan coaching (${needsCoaching.length})` :
                   `Top performers (${topPerformers.length})`}
                </button>
              ))}
            </div>

            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-4 h-28">
                  <div className="flex gap-3">
                    <div className="skeleton-shimmer w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton-shimmer h-3 w-32 rounded" />
                      <div className="skeleton-shimmer h-2 w-48 rounded" />
                    </div>
                  </div>
                </div>
              ))
            ) : displayed.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-text-secondary">Sin asesores en esta categoría</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayed.map((user, i) => (
                  <UserCoachingCard
                    key={user.userName}
                    user={user}
                    index={i}
                    simulations={simulations}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
