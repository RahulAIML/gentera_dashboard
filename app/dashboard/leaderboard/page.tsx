"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Star, Users, BarChart3 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { LeaderboardTable } from "@/components/analytics/LeaderboardTable";
import { KPICard } from "@/components/analytics/KPICard";
import { ScoreDistribution } from "@/components/analytics/ScoreDistribution";
import { useFilteredSimulations } from "@/hooks/useAnalyticsData";
import {
  computeLeaderboard,
  computeActivityKPIs,
  computeScoreDistribution,
  computeKPISummary,
} from "@/lib/analytics/kpiEngine";
import { fmtNumber, fmtPercent } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

export default function LeaderboardPage() {
  const { simulations, isLoading } = useFilteredSimulations();
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
    <div className="min-h-full bg-surface-950">
      <TopBar title="Leaderboard" subtitle="Ranking global de rendimiento" />

      <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Asesores Rankeados" value={fmtNumber(userLeaderboard.length)} icon={Users} accent="blue" index={0} loading={isLoading} />
          <KPICard title="Mejor Puntaje" value={userLeaderboard[0] ? `${userLeaderboard[0].avgScore.toFixed(0)}%` : "â€”"} subtitle={userLeaderboard[0]?.userName} icon={Trophy} accent="amber" index={1} loading={isLoading} />
          <KPICard title="Actividades Rankeadas" value={fmtNumber(activityLeaderboard.length)} icon={BarChart3} accent="violet" index={2} loading={isLoading} />
          <KPICard title="Puntaje Promedio Global" value={`${kpis.averageScore.toFixed(0)}%`} icon={Star} accent="emerald" index={3} loading={isLoading} />
        </div>

        {/* Podium - top 3 */}
        {!isLoading && userLeaderboard.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-6 text-center">Podio de Rendimiento</h3>
            <div className="flex items-end justify-center gap-4 sm:gap-8">
              {/* 2nd */}
              <div className="flex flex-col items-center gap-2 flex-1 max-w-[140px]">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-white font-bold">
                  {userLeaderboard[1].userName.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-text-primary truncate max-w-[110px]">{userLeaderboard[1].userName}</div>
                  <div className="text-lg font-bold text-slate-300">{userLeaderboard[1].avgScore.toFixed(0)}%</div>
                </div>
                <div className="w-full bg-slate-400/20 rounded-t-lg border border-slate-400/30 h-16 flex items-center justify-center">
                  <span className="text-2xl font-black text-slate-300">2</span>
                </div>
              </div>

              {/* 1st */}
              <div className="flex flex-col items-center gap-2 flex-1 max-w-[160px]">
                <Trophy className="w-6 h-6 text-amber-400" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg ring-4 ring-amber-400/30">
                  {userLeaderboard[0].userName.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-text-primary truncate max-w-[130px]">{userLeaderboard[0].userName}</div>
                  <div className="text-2xl font-black text-amber-400">{userLeaderboard[0].avgScore.toFixed(0)}%</div>
                </div>
                <div className="w-full bg-amber-400/20 rounded-t-lg border border-amber-400/30 h-24 flex items-center justify-center">
                  <span className="text-3xl font-black text-amber-400">1</span>
                </div>
              </div>

              {/* 3rd */}
              <div className="flex flex-col items-center gap-2 flex-1 max-w-[140px]">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold">
                  {userLeaderboard[2].userName.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-text-primary truncate max-w-[110px]">{userLeaderboard[2].userName}</div>
                  <div className="text-lg font-bold text-amber-600">{userLeaderboard[2].avgScore.toFixed(0)}%</div>
                </div>
                <div className="w-full bg-amber-700/20 rounded-t-lg border border-amber-700/30 h-10 flex items-center justify-center">
                  <span className="text-xl font-black text-amber-600">3</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab("users")}
            className={cn(
              "text-sm px-4 py-2 rounded-lg border transition-all",
              tab === "users"
                ? "bg-brand-500/12 border-brand-500/50 text-brand-400"
                : "border-border text-text-muted hover:border-surface-300"
            )}
          >
            Por Asesor
          </button>
          <button
            onClick={() => setTab("activities")}
            className={cn(
              "text-sm px-4 py-2 rounded-lg border transition-all",
              tab === "activities"
                ? "bg-brand-500/12 border-brand-500/50 text-brand-400"
                : "border-border text-text-muted hover:border-surface-300"
            )}
          >
            Por Actividad
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            {tab === "users" ? (
              <LeaderboardTable entries={userLeaderboard} loading={isLoading} maxRows={50} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-text-primary">Ranking de Actividades</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["#", "Actividad", "Simulaciones", "Puntaje Prom.", "AprobaciÃ³n", "Usuarios"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-text-muted font-semibold whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activityLeaderboard.map((a, i) => (
                      <motion.tr
                        key={a.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-border last:border-0 hover:bg-surface-700/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className={cn(
                            "text-sm font-bold",
                            i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-text-muted"
                          )}>{a.rank}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-text-primary max-w-[200px] truncate block" title={a.name}>
                            {a.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-text-secondary">{a.simulations}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "text-xs font-mono font-bold",
                            a.avgScore >= 70 ? "text-emerald-400" : a.avgScore >= 50 ? "text-amber-400" : "text-rose-400"
                          )}>
                            {a.avgScore.toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-text-secondary">{fmtPercent(a.passRate)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-text-muted">{a.uniqueUsers}</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </div>

          <div>
            <ScoreDistribution data={distribution} loading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
