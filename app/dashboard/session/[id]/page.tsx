"use client";
import { use, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Calendar, BookOpen, Target, Brain } from "lucide-react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { ConversationViewer } from "@/components/analytics/ConversationViewer";
import { useSimulations } from "@/hooks/useAnalyticsData";
import { useI18n } from "@/lib/i18n";
import { fmtDateTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { generateInsights } from "@/lib/analytics/insightEngine";
import { computeInteractionKPIs, computeActivityKPIs, computeUserKPIs } from "@/lib/analytics/kpiEngine";
import { AIInsightCard } from "@/components/analytics/AIInsightCard";

interface Props {
  params: Promise<{ id: string }>;
}

export default function SessionDrillDownPage({ params }: Props) {
  const { id } = use(params);
  const { simulations, isLoading } = useSimulations();
  const { t } = useI18n();

  const simulation = useMemo(
    () => simulations.find((s) => s.id === Number(id)),
    [simulations, id]
  );

  // Get other sessions from the same user for comparison
  const userSessions = useMemo(
    () => simulation ? simulations.filter((s) => s.userName === simulation.userName) : [],
    [simulations, simulation]
  );

  const userRank = useMemo(() => {
    const allUsers = [...new Set(simulations.map((s) => s.userName))];
    const userAvg = (userName: string) => {
      const us = simulations.filter((s) => s.userName === userName);
      return us.reduce((a, b) => a + b.score, 0) / us.length;
    };
    const sorted = allUsers.sort((a, b) => userAvg(b) - userAvg(a));
    return sorted.indexOf(simulation?.userName ?? "") + 1;
  }, [simulations, simulation]);

  if (isLoading) {
    return (
      <div className="min-h-full bg-surface-950">
        <TopBar title={t.common.loadingSession} />
        <div className="p-6 space-y-4 max-w-4xl mx-auto">
          <div className="skeleton-shimmer h-32 rounded-2xl" />
          <div className="skeleton-shimmer h-64 rounded-2xl" />
          <div className="skeleton-shimmer h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="min-h-full bg-surface-950">
        <TopBar title={t.common.sessionNotFound} />
        <div className="p-6 max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-text-secondary mb-4">{t.common.sessionNotFound} #{id}</p>
            <Link href="/dashboard/simulation" className="text-sm text-brand-400 hover:text-brand-300">
              ← {t.common.back}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const avgUserScore = userSessions.length
    ? userSessions.reduce((a, b) => a + b.score, 0) / userSessions.length
    : simulation.score;

  const sessionPassedRounds = simulation.rounds.filter((r) => r.score === 1).length;
  const sessionApplicableRounds = simulation.rounds.filter((r) => r.applicable).length;

  return (
    <div className="min-h-full bg-surface-950">
      <TopBar
        title={`Sesión #${simulation.id}`}
        subtitle={simulation.activityName}
      />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Back button */}
        <Link
          href="/dashboard/simulation"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.common.back}
        </Link>

        {/* Session header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-brand-400" />
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">{t.table.advisor}</p>
                <p className="text-sm font-semibold text-text-primary mt-0.5">{simulation.userName}</p>
                <p className="text-[11px] text-text-muted">{t.ai.rank} #{userRank}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">{t.table.activity}</p>
                <p className="text-sm font-semibold text-text-primary mt-0.5 leading-snug max-w-[180px]">
                  {simulation.activityName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">{t.table.date}</p>
                <p className="text-sm font-semibold text-text-primary mt-0.5">{fmtDateTime(simulation.timestamp)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">{t.table.performance}</p>
                <p className="text-sm font-semibold text-text-primary mt-0.5">
                  {sessionPassedRounds}/{sessionApplicableRounds} {t.table.interactions}
                </p>
                <p className="text-[11px] text-text-muted">
                  {t.ai.userAverage}: {avgUserScore.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Coaching panel */}
        {simulation.score < 80 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-5 border border-brand-500/20 bg-brand-500/4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-text-primary">{t.ai.coachingRec}</h3>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {t.ai.copilot}
              </span>
            </div>
            <div className="space-y-2">
              {simulation.rounds.filter((r) => r.applicable && r.score === 0 && r.index <= 5).map((r) => (
                <div key={r.index} className="flex gap-2.5 text-xs">
                  <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[9px] font-bold text-rose-400">{r.index}</span>
                  </div>
                  <div>
                    <p className="text-text-primary font-medium">Interaction {r.index} {t.ai.interactionNeedsReinforcement}</p>
                    <p className="text-text-muted leading-relaxed mt-0.5">
                      {r.feedback
                        ? r.feedback
                        : "Review the advisor's response in this interaction to identify areas for improvement in scenario handling."}
                    </p>
                  </div>
                </div>
              ))}
              {simulation.rounds.filter((r) => r.applicable && r.score === 0 && r.index <= 5).length === 0 && (
                <p className="text-xs text-text-secondary">{t.ai.noInteractionIssues}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Conversation replay */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ConversationViewer simulation={simulation} />
        </motion.div>

        {/* User session history */}
        {userSessions.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-4">
              {t.ai.sessionHistory} {simulation.userName}
              <span className="ml-2 text-xs text-text-muted font-normal">({userSessions.length} {t.common.results})</span>
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {userSessions
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map((s) => (
                  <Link
                    key={s.id}
                    href={`/dashboard/session/${s.id}`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all group",
                      s.id === simulation.id
                        ? "bg-brand-500/10 border border-brand-500/30"
                        : "hover:bg-surface-700/50"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-text-primary truncate">{s.activityName}</div>
                      <div className="text-[10px] text-text-muted">{fmtDateTime(s.timestamp)}</div>
                    </div>
                    <div className={cn(
                      "text-xs font-mono font-bold tabular-nums",
                      s.score >= 80 ? "text-emerald-400" : s.score >= 60 ? "text-brand-400" : "text-rose-400"
                    )}>
                      {s.score}%
                    </div>
                    <div className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full",
                      s.passed ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    )}>
                      {s.passed ? "✓" : "✗"}
                    </div>
                  </Link>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
