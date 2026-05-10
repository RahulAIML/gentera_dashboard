"use client";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, CheckCircle, Zap, Info, Sparkles } from "lucide-react";
import type { AIInsight } from "@/types/analytics";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";
import type { Dict } from "@/lib/i18n/locales/es";

const SEV: Record<string, { card: string; icon: string; badge: string; dot: string }> = {
  success:  { card: "border-emerald-500/25 bg-emerald-500/5",  icon: "text-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",  dot: "bg-emerald-400" },
  info:     { card: "border-brand-500/25 bg-brand-500/5",      icon: "text-brand-400",   badge: "bg-brand-500/10 text-brand-400 border-brand-500/25",         dot: "bg-brand-400" },
  warning:  { card: "border-amber-500/25 bg-amber-500/5",      icon: "text-amber-400",   badge: "bg-amber-500/10 text-amber-400 border-amber-500/25",         dot: "bg-amber-400" },
  critical: { card: "border-rose-500/25 bg-rose-500/5",        icon: "text-rose-400",    badge: "bg-rose-500/10 text-rose-400 border-rose-500/25",            dot: "bg-rose-400" },
};
const TYPE_ICONS = {
  achievement: CheckCircle,
  trend:       TrendingUp,
  risk:        AlertTriangle,
  anomaly:     AlertTriangle,
  opportunity: Zap,
};
function getTypeLabel(type: string, t: Dict): string {
  const map: Record<string, string> = {
    achievement: t.ai.achievement,
    trend:       t.ai.trend,
    risk:        t.ai.risk,
    anomaly:     t.ai.anomaly,
    opportunity: t.ai.opportunity,
  };
  return map[type] ?? type;
}

export function AIInsightCard({ insight, index = 0 }: { insight: AIInsight; index?: number }) {
  const { t } = useI18n();
  const s = SEV[insight.severity] ?? SEV.info;
  const Icon = TYPE_ICONS[insight.type] ?? Info;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className={cn("rounded-xl border p-3.5", s.card)}
    >
      <div className="flex items-start gap-2.5">
        <Icon className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", s.icon)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap mb-1">
            <span className="text-[11px] font-semibold text-text-primary leading-snug">{insight.title}</span>
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-bold uppercase tracking-wider shrink-0", s.badge)}>
              {getTypeLabel(insight.type, t)}
            </span>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">{insight.description}</p>
          {insight.metric && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-800 border border-border">
              <div className={cn("w-1.5 h-1.5 rounded-full live-dot", s.dot)} style={{ color: "inherit" }} />
              <span className="text-[10px] font-mono font-bold text-text-primary">{insight.metric}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function InsightsPanel({ insights, loading }: { insights: AIInsight[]; loading?: boolean }) {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 flex flex-col"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-brand-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{t.ai.insights}</h3>
          <p className="text-[10px] text-text-muted">{t.ai.autoAnalysis}</p>
        </div>
        <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
          AI
        </span>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[1,2,3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : insights.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 gap-3">
          <CheckCircle className="w-10 h-10 text-emerald-400/60" />
          <div className="text-center">
            <p className="text-sm font-semibold text-text-secondary">{t.ai.noAlerts}</p>
            <p className="text-xs text-text-muted mt-1">{t.ai.noAnomalies}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {insights.map((ins, i) => (
            <AIInsightCard key={ins.id} insight={ins} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
