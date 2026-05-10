"use client";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal } from "lucide-react";
import type { LeaderboardEntry } from "@/types/analytics";
import { cn } from "@/lib/utils/cn";
import { fmtPercent, initials } from "@/lib/utils/formatters";
import { useI18n } from "@/lib/i18n";

interface Props { entries: LeaderboardEntry[]; loading?: boolean; maxRows?: number; }

const BADGE_ICONS = { gold: Crown, silver: Trophy, bronze: Medal };
const BADGE_COLORS = {
  gold:   "from-amber-400 to-amber-600 ring-amber-500/40",
  silver: "from-slate-300 to-slate-500 ring-slate-400/30",
  bronze: "from-amber-600 to-amber-800 ring-amber-700/30",
};
const AVATAR_COLORS = [
  "from-brand-500 to-violet-600",
  "from-violet-500 to-blue-600",
  "from-emerald-500 to-brand-600",
  "from-blue-500 to-violet-600",
  "from-brand-600 to-cyan-600",
];

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#818cf8" : score >= 40 ? "#fbbf24" : "#fb7185";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-surface-800 rounded-full h-1.5 overflow-hidden max-w-[72px]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-black tabular-nums w-9" style={{ color }}>
        {Math.round(score)}%
      </span>
    </div>
  );
}

export function LeaderboardTable({ entries, loading, maxRows = 20 }: Props) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="glass rounded-2xl p-5">
        <div className="skeleton h-4 w-36 rounded mb-4" />
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
            <div className="skeleton w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3 w-32 rounded" />
              <div className="skeleton h-2 w-20 rounded" />
            </div>
            <div className="skeleton h-3 w-16 rounded" />
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
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-text-primary">{t.charts.leaderboard}</h3>
          <p className="text-[11px] text-text-muted mt-0.5">{t.charts.leaderboardSub}</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-brand-400" />
        </div>
      </div>

      <div className="space-y-0.5">
        {displayed.map((entry, i) => {
          const BadgeIcon = entry.badge ? BADGE_ICONS[entry.badge] : null;
          const passColor = entry.passRate >= 0.7
            ? "text-emerald-400 bg-emerald-500/10"
            : entry.passRate >= 0.5
            ? "text-brand-400 bg-brand-500/10"
            : "text-rose-400 bg-rose-500/10";

          return (
            <motion.div
              key={entry.userName}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group",
                i < 3 ? "bg-surface-800/60" : "hover:bg-surface-800/40"
              )}
            >
              {/* Rank */}
              <div className="w-7 shrink-0 flex justify-center">
                {entry.badge && BadgeIcon ? (
                  <div className={cn("w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center ring-2", BADGE_COLORS[entry.badge])}>
                    <BadgeIcon className="w-2.5 h-2.5 text-white" />
                  </div>
                ) : (
                  <span className="text-xs font-mono text-text-disabled">{entry.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className={cn(
                "w-7 h-7 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 text-white text-[9px] font-black",
                AVATAR_COLORS[i % AVATAR_COLORS.length]
              )}>
                {initials(entry.userName)}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-text-primary truncate">{entry.userName}</div>
                <div className="text-[10px] text-text-disabled">{entry.simulations} {t.charts.simAbbrev}</div>
              </div>

              {/* Score bar */}
              <div className="shrink-0 w-24">
                <ScoreBar score={entry.avgScore} />
              </div>

              {/* Pass rate badge */}
              <div className={cn("shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full", passColor)}>
                {fmtPercent(entry.passRate, 0)}
              </div>
            </motion.div>
          );
        })}
      </div>

      {entries.length > maxRows && (
        <div className="mt-3 pt-3 border-t border-border text-center">
          <span className="text-[11px] text-text-muted">+{entries.length - maxRows} {t.charts.moreItems}</span>
        </div>
      )}
    </motion.div>
  );
}
