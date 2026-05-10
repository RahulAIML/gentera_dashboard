"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity, Users, TrendingUp, CheckCircle,
  Calendar, BookOpen, Zap, Target,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { KPICard } from "@/components/analytics/KPICard";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { InteractionFunnel } from "@/components/analytics/InteractionFunnel";
import { InsightsPanel } from "@/components/analytics/AIInsightCard";
import { LeaderboardTable } from "@/components/analytics/LeaderboardTable";
import { ActivityChart } from "@/components/analytics/ActivityChart";
import { ScoreDistribution } from "@/components/analytics/ScoreDistribution";
import { useFilteredSimulations, useActivities } from "@/hooks/useAnalyticsData";
import {
  computeKPISummary,
  computeMonthlyTrend,
  computeInteractionKPIs,
  computeActivityKPIs,
  computeUserKPIs,
  computeLeaderboard,
  computeScoreDistribution,
} from "@/lib/analytics/kpiEngine";
import { generateInsights } from "@/lib/analytics/insightEngine";
import { fmtNumber, fmtPercent } from "@/lib/utils/formatters";

export default function ExecutiveOverviewPage() {
  const { simulations, isLoading } = useFilteredSimulations();

  const kpis        = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  const trend       = useMemo(() => computeMonthlyTrend(simulations), [simulations]);
  const interaction = useMemo(() => computeInteractionKPIs(simulations), [simulations]);
  const activity    = useMemo(() => computeActivityKPIs(simulations), [simulations]);
  const users       = useMemo(() => computeUserKPIs(simulations), [simulations]);
  const leaderboard = useMemo(() => computeLeaderboard(simulations), [simulations]);
  const distribution= useMemo(() => computeScoreDistribution(simulations), [simulations]);
  const insights    = useMemo(() => generateInsights(simulations, interaction, activity, users), [simulations, interaction, activity, users]);

  return (
    <div className="min-h-full bg-surface-950">
      <TopBar
        title="Executive Overview"
        subtitle="Plataforma de Inteligencia Conversacional · Gentera"
      />

      <div className="p-6 space-y-5 max-w-screen-2xl mx-auto">

        {/* ── Hero Banner ─────────────────────────────────────────── */}
        {!isLoading && simulations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-br from-surface-800 via-surface-850 to-surface-900 p-6"
          >
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-brand-500/8 blur-3xl" />
              <div className="absolute bottom-0 left-1/3 w-64 h-32 bg-blue-500/5 blur-2xl" />
              <div className="absolute top-4 right-4 opacity-5">
                <Zap className="w-32 h-32 text-brand-400" />
              </div>
            </div>
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">Sistema activo · Datos en tiempo real</span>
                </div>
                <h2 className="text-xl font-black text-text-primary leading-tight">
                  <span className="gradient-brand">{fmtNumber(kpis.totalSimulations)}</span>
                  {" "}simulaciones analizadas
                </h2>
                <p className="text-sm text-text-muted mt-1">
                  {fmtNumber(kpis.uniqueUsers)} asesores · {kpis.totalActivities} actividades · {fmtNumber(kpis.activeDays)} días activos
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-brand-400 tabular-nums">{kpis.averageScore.toFixed(0)}%</div>
                  <div className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">Puntaje promedio</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className={`text-3xl font-black tabular-nums ${kpis.passRate >= 0.6 ? "text-emerald-400" : "text-coral-400"}`}>
                    {fmtPercent(kpis.passRate, 0)}
                  </div>
                  <div className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">Tasa aprobación</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── KPI Cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <KPICard
            title="Simulaciones"
            value={fmtNumber(kpis.totalSimulations)}
            subtitle={`${kpis.activeDays} días activos`}
            delta={kpis.trend.simulationsDelta}
            trend={kpis.trend.simulationsDelta >= 0 ? "up" : "down"}
            icon={Activity}
            accent="amber"
            index={0}
            loading={isLoading}
          />
          <KPICard
            title="Usuarios Activos"
            value={fmtNumber(kpis.uniqueUsers)}
            subtitle="Asesores únicos"
            icon={Users}
            accent="blue"
            index={1}
            loading={isLoading}
          />
          <KPICard
            title="Puntaje Promedio"
            value={`${kpis.averageScore.toFixed(0)}%`}
            subtitle="Calificación media"
            delta={kpis.trend.scoreDelta}
            trend={kpis.trend.scoreDelta >= 0 ? "up" : "down"}
            icon={TrendingUp}
            accent="violet"
            index={2}
            loading={isLoading}
          />
          <KPICard
            title="Tasa Aprobación"
            value={fmtPercent(kpis.passRate, 0)}
            subtitle="Diagnóstico positivo"
            delta={kpis.trend.passRateDelta}
            trend={kpis.trend.passRateDelta >= 0 ? "up" : "down"}
            icon={CheckCircle}
            accent="emerald"
            index={3}
            loading={isLoading}
          />
          <KPICard
            title="Actividades"
            value={fmtNumber(kpis.totalActivities)}
            subtitle="Casos de uso activos"
            icon={BookOpen}
            accent="amber"
            index={4}
            loading={isLoading}
          />
          <KPICard
            title="Días Activos"
            value={fmtNumber(kpis.activeDays)}
            subtitle="Con simulaciones"
            icon={Calendar}
            accent="blue"
            index={5}
            loading={isLoading}
          />
        </div>

        {/* ── Trend + Insights ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <ScoreTrendChart data={trend} loading={isLoading} />
          </div>
          <InsightsPanel insights={insights} loading={isLoading} />
        </div>

        {/* ── Interaction Funnel + Distribution ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InteractionFunnel data={interaction} loading={isLoading} />
          <ScoreDistribution data={distribution} loading={isLoading} />
        </div>

        {/* ── Activity + Leaderboard ───────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ActivityChart data={activity} loading={isLoading} />
          <LeaderboardTable entries={leaderboard} loading={isLoading} maxRows={8} />
        </div>
      </div>
    </div>
  );
}
