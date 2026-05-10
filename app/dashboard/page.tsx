"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, BarChart3, TrendingUp, Target } from "lucide-react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { KPICard } from "@/components/analytics/KPICard";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { useFilteredSimulations } from "@/hooks/useAnalyticsData";
import { computeKPISummary, computeMonthlyTrend, computeLeaderboard } from "@/lib/analytics/kpiEngine";
import { fmtNumber, fmtPercent } from "@/lib/utils/formatters";
import { useI18n } from "@/lib/i18n";

export default function ExecutiveOverviewPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { t } = useI18n();

  const kpis = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  const trend = useMemo(() => computeMonthlyTrend(simulations), [simulations]);
  const leaderboard = useMemo(() => computeLeaderboard(simulations), [simulations]);

  const topUsers = leaderboard.slice(0, 5);

  return (
    <div className="min-h-full bg-surface-950">
      <TopBar title={t.nav.dashboard} subtitle={t.scope.organization} />

      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title={t.kpi.totalSimulations} value={fmtNumber(kpis.totalSimulations)} icon={BarChart3} accent="brand" loading={isLoading} />
          <KPICard title={t.kpi.uniqueUsers} value={fmtNumber(kpis.uniqueUsers)} icon={Users} accent="blue" loading={isLoading} />
          <KPICard title={t.kpi.avgScore} value={`${kpis.averageScore.toFixed(0)}%`} icon={TrendingUp} accent="emerald" loading={isLoading} />
          <KPICard title={t.kpi.passRate} value={fmtPercent(kpis.passRate)} icon={Target} accent="cyan" loading={isLoading} />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Primary Chart - 2 cols */}
          <div className="lg:col-span-2">
            <ScoreTrendChart data={trend} loading={isLoading} />
          </div>

          {/* Secondary Insight - 1 col */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-surface-900/60 p-6">
            <h3 className="text-sm font-bold text-text-primary mb-4">Top Performers</h3>
            <div className="space-y-3">
              {topUsers.map((user, i) => (
                <Link key={user.userName} href={`/dashboard/leaderboard`}>
                  <div className="group p-3 rounded-lg hover:bg-surface-800/40 transition-colors cursor-pointer">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-text-primary">#{i + 1} {user.userName.split(" ")[0]}</span>
                      <span className="text-xs font-bold text-emerald-400">{user.avgScore.toFixed(0)}%</span>
                    </div>
                    <div className="text-[11px] text-text-muted">{user.simulations} sims</div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Simulations", href: "/dashboard/simulation" },
            { label: "Trends", href: "/dashboard/trends" },
            { label: "Organization", href: "/dashboard/organizational" },
            { label: "Leaderboard", href: "/dashboard/leaderboard" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="p-4 rounded-xl border border-border/50 hover:border-brand-500/30 bg-surface-900/30 hover:bg-surface-900/60 transition-all cursor-pointer">
                <div className="text-xs font-semibold text-text-primary group-hover:text-brand-400">{item.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
