"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Search, ExternalLink, CheckCircle, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { KPICard } from "@/components/analytics/KPICard";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { useFilteredSimulations } from "@/hooks/useAnalyticsData";
import { computeKPISummary, computeMonthlyTrend } from "@/lib/analytics/kpiEngine";
import { fmtNumber, fmtPercent, fmtDateTime, scoreBandColor, scoreToBand } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";

const PAGE_SIZE = 20;

export default function SimulationPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"date" | "score" | "user">("date");

  const kpis = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  const trend = useMemo(() => computeMonthlyTrend(simulations), [simulations]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return simulations
      .filter((s) =>
        !q ||
        s.userName.toLowerCase().includes(q) ||
        s.activityName.toLowerCase().includes(q) ||
        String(s.id).includes(q)
      )
      .sort((a, b) => {
        if (sort === "score") return b.score - a.score;
        if (sort === "user") return a.userName.localeCompare(b.userName);
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
  }, [simulations, search, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-full bg-surface-950">
      <TopBar title={t.nav.simulations} subtitle={t.scope.organization} />

      <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard title={t.kpi.totalSimulations} value={fmtNumber(kpis.totalSimulations)} icon={Activity} accent="brand" index={0} loading={isLoading} />
          <KPICard title={t.kpi.uniqueUsers} value={fmtNumber(kpis.uniqueUsers)} icon={Users} accent="blue" index={1} loading={isLoading} />
          <KPICard title={t.kpi.avgScore} value={`${kpis.averageScore.toFixed(0)}%`} icon={TrendingUp} accent="violet" index={2} loading={isLoading} />
          <KPICard title={t.kpi.passRate} value={fmtPercent(kpis.passRate)} icon={CheckCircle} accent="emerald" index={3} loading={isLoading} />
        </div>

        {/* Trend */}
        <ScoreTrendChart data={trend} loading={isLoading} />

        {/* Table */}
        <div className="rounded-2xl border border-border bg-surface-900/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">{t.nav.simulations}</h3>
              <p className="text-xs text-text-muted mt-0.5">{fmtNumber(filtered.length)} {t.common.results}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {(["date", "score", "user"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSort(s); setPage(1); }}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-lg border transition-all",
                      sort === s
                        ? "bg-brand-500/10 border-brand-500/40 text-brand-400"
                        : "border-border text-text-muted hover:border-border-strong"
                    )}
                  >
                    {s === "date" ? t.table.date : s === "score" ? t.table.score : t.table.user}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-surface-800 border border-border rounded-lg px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-text-muted" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder={t.common.search}
                  className="bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none w-48"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full analytics-table">
              <thead>
                <tr className="border-b border-border">
                  {[t.table.id, t.table.user, t.table.activity, t.table.date, t.table.score, t.table.diagnosis, ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-text-muted font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="skeleton h-3 w-24 rounded" /></td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-text-muted text-sm">{t.common.noData}</td>
                  </tr>
                ) : (
                  paginated.map((s, i) => {
                    const color = scoreBandColor(scoreToBand(s.score));
                    return (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3"><span className="text-xs font-mono text-text-muted">#{s.id}</span></td>
                        <td className="px-4 py-3"><span className="text-xs font-medium text-text-primary">{s.userName}</span></td>
                        <td className="px-4 py-3"><span className="text-xs text-text-secondary max-w-[180px] truncate block" title={s.activityName}>{s.activityName}</span></td>
                        <td className="px-4 py-3"><span className="text-xs text-text-muted whitespace-nowrap">{fmtDateTime(s.timestamp)}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 bg-surface-700 rounded-full h-1.5 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: color }} />
                            </div>
                            <span className="text-xs font-mono font-bold tabular-nums" style={{ color }}>{s.score}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                            s.passed ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          )}>
                            {s.passed ? t.table.approved : t.table.failed}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/dashboard/session/${s.id}`} className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-1">
                            {t.table.viewDetails} <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <span className="text-xs text-text-muted">{t.common.page} {page} {t.common.of} {totalPages}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-xs border border-border rounded-lg text-text-secondary disabled:opacity-40 hover:border-brand-500/40 transition-all">{t.common.previous}</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-xs border border-border rounded-lg text-text-secondary disabled:opacity-40 hover:border-brand-500/40 transition-all">{t.common.next}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
