"use client";
import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";
import type { LeaderboardEntry } from "@/types/analytics";
import { cn } from "@/lib/utils/cn";
import { fmtScore, fmtPercent, initials } from "@/lib/utils/formatters";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  loading?: boolean;
  maxRows?: number;
}

const BADGE_STYLES = {
  gold: "from-amber-400 to-amber-600",
  silver: "from-slate-300 to-slate-500",
  bronze: "from-amber-600 to-amber-800",
};

const BADGE_ICONS = {
  gold: Trophy,
  silver: Medal,
  bronze: Award,
};

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-surface-600 rounded-full h-1.5 overflow-hidden max-w-[80px]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: value >= 80 ? "#10b981" : value >= 60 ? "#3b82f6" : value >= 40 ? "#f59e0b" : "#ef4444",
          }}
        />
      </div>
      <span className="text-xs font-mono font-semibold text-text-primary tabular-nums w-8">{Math.round(value)}%</span>
    </div>
  );
}

export function LeaderboardTable({ entries, loading, maxRows = 20 }: LeaderboardTableProps) {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <div className="skeleton-shimmer h-4 w-32 rounded mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3 py-3 border-b border-border last:border-0">
            <div className="skeleton-shimmer w-8 h-8 rounded-full" />
            <div className="flex-1">
              <div className="skeleton-shimmer h-3 w-32 rounded mb-1.5" />
              <div className="skeleton-shimmer h-2 w-20 rounded" />
            </div>
            <div className="skeleton-shimmer h-3 w-16 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const displayed = entries.slice(0, maxRows);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Ranking de Asesores</h3>
          <p className="text-xs text-text-muted mt-0.5">Por puntaje promedio</p>
        </div>
        <Trophy className="w-4 h-4 text-amber-400" />
      </div>

      <div className="space-y-0.5">
        {displayed.map((entry, i) => {
          const BadgeIcon = entry.badge ? BADGE_ICONS[entry.badge] : null;
          const avatarColors = [
            "from-brand-500 to-brand-700",
            "from-violet-500 to-violet-700",
            "from-emerald-500 to-emerald-700",
            "from-cyan-500 to-cyan-700",
          ];

          return (
            <motion.div
              key={entry.userName}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group",
                i < 3 ? "bg-surface-700/60" : "hover:bg-surface-700/40"
              )}
            >
              {/* Rank */}
              <div className="w-6 shrink-0 text-center">
                {entry.badge && BadgeIcon ? (
                  <div className={cn("w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center mx-auto", BADGE_STYLES[entry.badge])}>
                    <BadgeIcon className="w-2.5 h-2.5 text-white" />
                  </div>
                ) : (
                  <span className="text-xs font-mono text-text-muted">{entry.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className={cn(
                "w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center shrink-0 text-white text-[10px] font-bold",
                avatarColors[i % avatarColors.length]
              )}>
                {initials(entry.userName)}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-text-primary truncate">{entry.userName}</div>
                <div className="text-[10px] text-text-muted">{entry.simulations} simulaciones</div>
              </div>

              {/* Score bar */}
              <div className="shrink-0 w-28">
                <ScoreBar value={entry.avgScore} />
              </div>

              {/* Pass rate */}
              <div className="shrink-0 w-14 text-right">
                <span className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  entry.passRate >= 0.7
                    ? "bg-emerald-500/10 text-emerald-400"
                    : entry.passRate >= 0.5
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-red-500/10 text-red-400"
                )}>
                  {fmtPercent(entry.passRate, 0)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {entries.length > maxRows && (
        <div className="mt-3 text-center">
          <span className="text-xs text-text-muted">+{entries.length - maxRows} más</span>
        </div>
      )}
    </motion.div>
  );
}
