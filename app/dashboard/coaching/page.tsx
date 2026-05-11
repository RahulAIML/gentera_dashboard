"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Brain, User, ChevronRight, Star, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { PageShell, PageSection } from "@/components/layout/PageShell";
import { PageActions } from "@/components/layout/PageActions";
import { FilterBar } from "@/components/layout/FilterBar";
import { KPICard } from "@/components/analytics/KPICard";
import { useFilteredSimulations } from "@/hooks/useAnalyticsData";
import { computeUserKPIs } from "@/lib/analytics/kpiEngine";
import { fmtNumber, fmtPercent, initials } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";
import type { NormalizedSimulation, UserKPI } from "@/types/analytics";

function UserCoachingCard({ user, index, simulations }: { user: UserKPI; index: number; simulations: NormalizedSimulation[] }) {
  const { t } = useI18n();
  const userSims = simulations.filter((s) => s.userName === user.userName);
  const needsCoaching = user.averageScore < 60 || user.passRate < 0.5;

  const roundScores = [1, 2, 3, 4, 5].map((i) => {
    const applicable = userSims.filter((s) => s.rounds[i - 1]?.applicable);
    const passed = applicable.filter((s) => s.rounds[i - 1]?.score === 1);
    return { round: i, passRate: applicable.length ? passed.length / applicable.length : null, applicable: applicable.length };
  });
  const weakestRound = roundScores.filter((r) => r.passRate !== null && r.applicable > 0).sort((a, b) => (a.passRate ?? 1) - (b.passRate ?? 1))[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "rounded-xl p-4 border bg-surface-900/60 transition-all hover:border-brand-500/30",
        needsCoaching ? "border-amber-500/20" : "border-border"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials(user.userName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-text-primary truncate">{user.userName}</span>
            {needsCoaching && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                {t.ai.coaching}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
            <span>{user.simulationCount} {t.charts.simAbbrev}</span>
            <span className={cn("font-semibold", user.averageScore >= 70 ? "text-emerald-400" : user.averageScore >= 50 ? "text-amber-400" : "text-rose-400")}>
              {user.averageScore.toFixed(0)}%
            </span>
            <span>{fmtPercent(user.passRate)}</span>
          </div>
        </div>
        <Link href="/dashboard/leaderboard" className="text-text-muted hover:text-brand-400 transition-colors shrink-0 mt-1">
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {roundScores.map((r) => (
          <div key={r.round} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-surface-700 rounded-full h-1.5 overflow-hidden">
              {r.passRate !== null ? (
                <div className="h-full rounded-full" style={{ width: `${r.passRate * 100}%`, background: r.passRate >= 0.7 ? "#10b981" : r.passRate >= 0.5 ? "#f59e0b" : "#ef4444" }} />
              ) : (
                <div className="h-full w-full bg-surface-600/50 rounded-full" />
              )}
            </div>
            <span className="text-[9px] text-text-disabled">I{r.round}</span>
          </div>
        ))}
      </div>

      {weakestRound && weakestRound.passRate !== null && weakestRound.passRate < 0.7 && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15">
          <p className="text-[11px] text-amber-400">
            <span className="font-semibold">{t.ai.coachingRec}:</span> Int. {weakestRound.round} — {(weakestRound.passRate * 100).toFixed(0)}%
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function CoachingPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { t, locale } = useI18n();
  const [filter, setFilter] = useState<"all" | "coaching" | "top">("all");

  const userKPIs = useMemo(() => computeUserKPIs(simulations), [simulations]);
  const needsCoaching = useMemo(() => userKPIs.filter((u) => u.averageScore < 60 || u.passRate < 0.5), [userKPIs]);
  const topPerformers = useMemo(() => userKPIs.filter((u) => u.averageScore >= 80 && u.passRate >= 0.7), [userKPIs]);

  const displayed = useMemo(() => {
    if (filter === "coaching") return needsCoaching;
    if (filter === "top") return topPerformers;
    return userKPIs;
  }, [filter, userKPIs, needsCoaching, topPerformers]);

  return (
    <PageShell
      title={t.nav.coaching}
      subtitle={t.scope.organization}
      actions={<PageActions />}
      filters={<FilterBar />}
    >
      <PageSection variant="bare">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard title={t.kpi.uniqueUsers} value={fmtNumber(userKPIs.length, locale)} icon={User} accent="blue" index={0} loading={isLoading} />
          <KPICard title={t.ai.coaching} value={fmtNumber(needsCoaching.length, locale)} subtitle={fmtPercent(userKPIs.length ? needsCoaching.length / userKPIs.length : 0)} icon={AlertTriangle} accent="amber" index={1} loading={isLoading} />
          <KPICard title={t.ai.performance} value={fmtNumber(topPerformers.length, locale)} icon={Star} accent="emerald" index={2} loading={isLoading} />
          <KPICard title={t.ai.insights} value={fmtNumber(userKPIs.length ? userKPIs.filter((u) => u.simulationCount >= 3).length : 0, locale)} icon={Brain} accent="violet" index={3} loading={isLoading} />
        </div>
      </PageSection>

      <PageSection
        variant="bare"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "coaching", "top"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "h-9 px-3 rounded-xl border transition-colors text-[12px] font-medium",
                  filter === f
                    ? "bg-brand-500/10 border-brand-500/25 text-text-primary"
                    : "border-border bg-surface-900/40 text-text-secondary hover:bg-surface-800/60"
                )}
              >
                {f === "all"
                  ? `${t.filters.all} (${userKPIs.length})`
                  : f === "coaching"
                  ? `${t.ai.coaching} (${needsCoaching.length})`
                  : `${t.ai.performance} (${topPerformers.length})`}
              </button>
            ))}
          </div>
        }
      >
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-4 border border-border bg-surface-900/60 h-28">
                <div className="flex gap-3">
                  <div className="skeleton w-9 h-9 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-32 rounded" />
                    <div className="skeleton h-2 w-48 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="rounded-2xl p-10 border border-border bg-surface-900/60 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <p className="text-sm text-text-muted">{t.common.noData}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayed.map((user, i) => (
              <UserCoachingCard key={user.userName} user={user} index={i} simulations={simulations} />
            ))}
          </div>
        )}
      </PageSection>
    </PageShell>
  );
}
