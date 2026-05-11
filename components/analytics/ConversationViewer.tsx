"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Bot, CheckCircle, XCircle, Minus,
  ChevronDown, ChevronUp, Star,
} from "lucide-react";
import type { NormalizedSimulation, InteractionRound } from "@/types/analytics";
import { cn } from "@/lib/utils/cn";
import { fmtDateTime } from "@/lib/utils/formatters";
import { useI18n } from "@/lib/i18n";

interface RoundCardProps {
  round: InteractionRound;
  index: number;
}

function RoundCard({ round, index }: RoundCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { t, locale } = useI18n();

  const scoreIcon = round.score === 1
    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
    : round.score === 0
    ? <XCircle className="w-4 h-4 text-rose-400" />
    : <Minus className="w-4 h-4 text-text-muted" />;

  const borderColor = round.score === 1
    ? "border-emerald-500/30 bg-emerald-500/5"
    : round.score === 0
    ? "border-rose-500/30 bg-rose-500/5"
    : "border-border";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn("rounded-xl border overflow-hidden", borderColor)}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-700/30 transition-colors"
      >
        <div className="shrink-0">{scoreIcon}</div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-text-primary">{t.charts.interactionLabel} {round.index}</span>
          {!expanded && round.prompt && (
            <span className="text-xs text-text-muted ml-2 truncate hidden sm:inline">
              — {round.prompt.slice(0, 60)}…
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {round.applicable && (
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              round.score === 1 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            )}>
              {round.score === 1 ? `✓ ${t.table.approved}` : `✕ ${t.table.failed}`}
            </span>
          )}
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* AI Prompt */}
              <div className="rounded-lg bg-surface-800 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                    {locale === "en" ? "AI scenario" : "Escenario IA"}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{round.prompt || "—"}</p>
              </div>

              {/* User Response */}
              {round.response && round.response !== "No aplica" && (
                <div className="rounded-lg bg-brand-500/5 border border-brand-500/20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-3.5 h-3.5 text-brand-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-400">
                      {locale === "en" ? "Advisor response" : "Respuesta del asesor"}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{round.response}</p>
                </div>
              )}

              {/* AI Feedback */}
              {round.feedback && (
                <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                      {locale === "en" ? "AI feedback" : "Retroalimentación IA"}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{round.feedback}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ConversationViewerProps {
  simulation: NormalizedSimulation;
}

export function ConversationViewer({ simulation }: ConversationViewerProps) {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-sm font-bold text-text-primary">{simulation.activityName}</h3>
            <p className="text-xs text-text-muted mt-0.5">{fmtDateTime(simulation.timestamp, locale)}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums" style={{
                color: simulation.score >= 80 ? "#34d399" : simulation.score >= 60 ? "#818cf8" : "#fb7185"
              }}>
                {simulation.score}%
              </div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">{t.table.score}</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold border",
              simulation.passed
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
            )}>
              {simulation.passed ? `✓ ${t.table.approved}` : `✕ ${t.table.failed}`}
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary tabular-nums">
                {simulation.totalPoints}/{simulation.maxApplicablePoints}
              </div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">{locale === "en" ? "Points" : "Puntos"}</div>
            </div>
          </div>
        </div>

        {/* Score breakdown — rounds 1–5 only */}
        <div className="mt-4 flex gap-1.5">
          {simulation.rounds.slice(0, 5).map((r) => (
            <div
              key={r.index}
              className={cn(
                "flex-1 h-1.5 rounded-full",
                !r.applicable ? "bg-surface-700" :
                r.score === 1 ? "bg-emerald-400" : "bg-rose-400"
              )}
              title={`Interacción ${r.index}: ${!r.applicable ? "N/A" : r.score === 1 ? "Aprobó" : "No aprobó"}`}
            />
          ))}
        </div>
      </div>

      {/* Rounds — skip round 6 (always "No aplica") */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted px-1">
          Transcripción Conversacional
        </h4>
        {simulation.rounds
          .filter((r) => r.applicable || r.index <= 5)
          .filter((r) => r.index <= 5)
          .map((r, i) => (
            <RoundCard key={r.index} round={r} index={i} />
          ))}
      </div>
    </div>
  );
}
