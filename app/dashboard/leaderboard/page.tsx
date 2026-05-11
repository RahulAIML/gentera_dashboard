"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Users, BarChart3 } from "lucide-react";
import { PageShell, PageSection } from "@/components/layout/PageShell";
import { PageActions } from "@/components/layout/PageActions";
import { FilterBar } from "@/components/layout/FilterBar";
import { LeaderboardTable } from "@/components/analytics/LeaderboardTable";
import { KPICard } from "@/components/analytics/KPICard";
import { ScoreDistribution } from "@/components/analytics/ScoreDistribution";
import { useFilteredSimulations } from "@/hooks/useAnalyticsData";
import { computeLeaderboard, computeActivityKPIs, computeScoreDistribution, computeKPISummary } from "@/lib/analytics/kpiEngine";
import { fmtNumber, fmtPercent } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";

export default function LeaderboardPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<"users" | "activities">("users");

  const kpis = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  const userLeaderboard = useMemo(() => computeLeaderboard(simulations), [simulations]);
  const activityKPIs = useMemo(() => computeActivityKPIs(simulations), [simulations]);
  const distribution = useMemo(() => computeScoreDistribution(simulations), [simulations]);

  const activityLeaderboard = useMemo(() =>
    activityKPIs.map((a, i) => ({
      rank: i + 1,
      name: a.activityName,
      simulations: a.simulationCount,
      avgScore: a.averageScore,
      passRate: a.passRate,
      uniqueUsers: a.uniqueUsers,
      badge: i === 0 ? "gold" as const : i === 1 ? "silver" as const : i === 2 ? "bronze" as const : undefined,
    })),
    [activityKPIs]
  );

  return (
    <PageShell
      title={t.nav.leaderboard}
      subtitle={t.scope.organization}
      actions={<PageActions />}
      filters={<FilterBar />}
    >
      <PageSection variant="bare">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard title={t.charts.leaderboard} value={fmtNumber(userLeaderboard.length, locale)} icon={Users} accent="brand" index={0} loading={isLoading} />
          <KPICard title={t.kpi.avgScore} value={userLeaderboard[0] ? `${userLeaderboard[0].avgScore.toFixed(0)}%` : "—"} subtitle={userLeaderboard[0]?.userName} icon={Trophy} accent="amber" index={1} loading={isLoading} />
          <KPICard title={t.kpi.totalActivities} value={fmtNumber(activityLeaderboard.length, locale)} icon={BarChart3} accent="violet" index={2} loading={isLoading} />
          <KPICard title={t.kpi.avgScore} value={`${kpis.averageScore.toFixed(0)}%`} icon={Star} accent="emerald" index={3} loading={isLoading} />
        </div>
      </PageSection>

      {!isLoading && userLeaderboard.length >= 3 && (
        <PageSection title={t.charts.leaderboard} description={t.charts.leaderboardSub}>
          <div className="flex items-end justify-center gap-4 sm:gap-8">
            {/* 2nd */}
            <div className="flex flex-col items-center gap-2 flex-1 max-w-[160px]">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-white font-bold text-sm">
                {userLeaderboard[1].userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-text-primary truncate max-w-[140px]">{userLeaderboard[1].userName}</div>
                <div className="text-lg font-bold text-slate-300">{userLeaderboard[1].avgScore.toFixed(0)}%</div>
              </div>
              <div className="w-full bg-surface-700 rounded-t-lg h-14 flex items-center justify-center">
                <span className="text-xl font-black text-slate-400">2</span>
              </div>
            </div>

            {/* 1st */}
            <div className="flex flex-col items-center gap-2 flex-1 max-w-[180px]">
              <Trophy className="w-5 h-5 text-amber-400" />
              <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-amber-400/30">
                {userLeaderboard[0].userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-text-primary truncate max-w-[160px]">{userLeaderboard[0].userName}</div>
                <div className="text-2xl font-black text-amber-400">{userLeaderboard[0].avgScore.toFixed(0)}%</div>
              </div>
              <div className="w-full bg-amber-400/10 rounded-t-lg h-20 flex items-center justify-center border border-amber-400/20">
                <span className="text-2xl font-black text-amber-400">1</span>
              </div>
            </div>

            {/* 3rd */}
            <div className="flex flex-col items-center gap-2 flex-1 max-w-[160px]">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold text-sm">
                {userLeaderboard[2].userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-text-primary truncate max-w-[140px]">{userLeaderboard[2].userName}</div>
                <div className="text-lg font-bold text-amber-600">{userLeaderboard[2].avgScore.toFixed(0)}%</div>
              </div>
              <div className="w-full bg-surface-700 rounded-t-lg h-10 flex items-center justify-center">
                <span className="text-lg font-black text-amber-700">3</span>
              </div>
            </div>
          </div>
        </PageSection>
      )}

      <PageSection
        variant="bare"
        actions={
          <div className="flex gap-2">
            {(["users", "activities"] as const).map((tb) => (
              <button
                key={tb}
                onClick={() => setTab(tb)}
                className={cn(
                  "h-9 px-3 rounded-xl border transition-colors text-[12px] font-medium",
                  tab === tb
                    ? "bg-brand-500/10 border-brand-500/25 text-text-primary"
                    : "border-border bg-surface-900/40 text-text-secondary hover:bg-surface-800/60"
                )}
              >
                {tb === "users" ? t.table.user : t.kpi.totalActivities}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {tab === "users" ? (
              <LeaderboardTable entries={userLeaderboard} loading={isLoading} maxRows={20} />
            ) : (
              <div className="rounded-2xl border border-border bg-surface-900/60 overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-text-primary">{t.kpi.totalActivities}</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["#", t.table.activity, t.kpi.avgScore, t.kpi.passRate].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-text-muted font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activityLeaderboard.slice(0, 20).map((a, i) => (
                      <motion.tr key={a.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border last:border-0 hover:bg-surface-800/30 transition-colors">
                        <td className="px-4 py-3"><span className={cn("text-sm font-bold", i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-text-muted")}>{a.rank}</span></td>
                        <td className="px-4 py-3"><span className="text-xs font-medium text-text-primary truncate" title={a.name}>{a.name}</span></td>
                        <td className="px-4 py-3"><span className={cn("text-xs font-mono font-bold", a.avgScore >= 70 ? "text-emerald-400" : a.avgScore >= 50 ? "text-amber-400" : "text-rose-400")}>{a.avgScore.toFixed(0)}%</span></td>
                        <td className="px-4 py-3"><span className="text-xs text-text-secondary">{fmtPercent(a.passRate)}</span></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div>
            <ScoreDistribution data={distribution} loading={isLoading} />
          </div>
        </div>
      </PageSection>
    </PageShell>
  );
}
