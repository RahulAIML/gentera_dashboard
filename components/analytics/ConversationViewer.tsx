"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, User, Bot, CheckCircle, XCircle, Minus,
  ChevronDown, ChevronUp, Star,
} from "lucide-react";
import type { NormalizedSimulation, InteractionRound } from "@/types/analytics";
import { cn } from "@/lib/utils/cn";
import { fmtDateTime, fmtScore } from "@/lib/utils/formatters";

interface RoundCardProps {
  round: InteractionRound;
  index: number;
}

function RoundCard({ round, index }: RoundCardProps) {
  const [expanded, setExpanded] = useState(false);

  const scoreIcon = round.score === 1
    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
    : round.score === 0
    ? <XCircle className="w-4 h-4 text-red-400" />
    : <Minus className="w-4 h-4 text-text-muted" />;

  const borderColor = round.score === 1
    ? "border-emerald-500/30 bg-emerald-500/5"
    : round.score === 0
    ? "border-red-500/30 bg-red-500/5"
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
          <span className="text-xs font-semibold text-text-primary">Interacción {round.index}</span>
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
              round.score === 1 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            )}>
              {round.score === 1 ? "✓ Aprobó" : "✗ No aprobó"}
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
              <div className="rounded-lg bg-surface-700 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">Escenario IA</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{round.prompt || "Sin contenido"}</p>
              </div>

              {/* User Response */}
              {round.response && round.response !== "No aplica" && (
                <div className="rounded-lg bg-brand-500/5 border border-brand-500/20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-3.5 h-3.5 text-brand-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-400">Respuesta del Asesor</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{round.response}</p>
                </div>
              )}

              {/* AI Feedback */}
              {round.feedback && (
                <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Retroalimentación IA</span>
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
  onClose?: () => void;
}

export function ConversationViewer({ simulation, onClose }: ConversationViewerProps) {
  const applicableRounds = simulation.rounds.filter((r) => r.applicable);
  const passedRounds = applicableRounds.filter((r) => r.score === 1);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-sm font-bold text-text-primary">{simulation.activityName}</h3>
            <p className="text-xs text-text-muted mt-0.5">{fmtDateTime(simulation.timestamp)}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums" style={{
                color: simulation.score >= 80 ? "#10b981" : simulation.score >= 60 ? "#3b82f6" : "#ef4444"
              }}>
                {simulation.score}%
              </div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">Puntaje</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold border",
              simulation.passed
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            )}>
              {simulation.passed ? "✓ Diagnóstico Aprobatorio" : "✗ No Aprobatorio"}
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary tabular-nums">
                {simulation.totalPoints}/{simulation.maxApplicablePoints}
              </div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">Puntos</div>
            </div>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="mt-4 flex gap-1.5">
          {simulation.rounds.map((r) => (
            <div
              key={r.index}
              className={cn(
                "flex-1 h-1.5 rounded-full",
                !r.applicable ? "bg-surface-600" :
                r.score === 1 ? "bg-emerald-400" : "bg-red-400"
              )}
              title={`Interacción ${r.index}: ${!r.applicable ? "N/A" : r.score === 1 ? "Aprobó" : "No aprobó"}`}
            />
          ))}
        </div>
      </div>

      {/* Rounds */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted px-1">
          Transcripción Conversacional
        </h4>
        {simulation.rounds.map((r, i) => (
          <RoundCard key={r.index} round={r} index={i} />
        ))}
      </div>
    </div>
  );
}
