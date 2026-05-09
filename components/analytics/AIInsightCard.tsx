"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, Zap } from "lucide-react";
import type { AIInsight } from "@/types/analytics";
import { cn } from "@/lib/utils/cn";

const SEVERITY_STYLES = {
  success: {
    card: "border-emerald-500/30 bg-emerald-500/5",
    icon: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  info: {
    card: "border-brand-500/30 bg-brand-500/5",
    icon: "text-brand-400",
    badge: "bg-brand-500/10 text-brand-400 border-brand-500/20",
    dot: "bg-brand-400",
  },
  warning: {
    card: "border-amber-500/30 bg-amber-500/5",
    icon: "text-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  critical: {
    card: "border-red-500/30 bg-red-500/5",
    icon: "text-red-400",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    dot: "bg-red-400",
  },
};

const TYPE_ICONS = {
  achievement: CheckCircle,
  trend: TrendingUp,
  risk: AlertTriangle,
  anomaly: AlertTriangle,
  opportunity: Zap,
};

const TYPE_LABELS: Record<string, string> = {
  achievement: "Logro",
  trend: "Tendencia",
  risk: "Riesgo",
  anomaly: "Anomalía",
  opportunity: "Oportunidad",
};

interface AIInsightCardProps {
  insight: AIInsight;
  index?: number;
}

export function AIInsightCard({ insight, index = 0 }: AIInsightCardProps) {
  const styles = SEVERITY_STYLES[insight.severity];
  const IconComp = TYPE_ICONS[insight.type] ?? Info;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={cn(
        "rounded-xl border p-4 relative overflow-hidden",
        styles.card
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("shrink-0 mt-0.5", styles.icon)}>
          <IconComp className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-semibold text-text-primary leading-tight">{insight.title}</span>
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium", styles.badge)}>
              {TYPE_LABELS[insight.type]}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">{insight.description}</p>
          {insight.metric && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-600 border border-border">
              <div className={cn("w-1.5 h-1.5 rounded-full pulse-dot", styles.dot)} />
              <span className="text-xs font-mono font-semibold text-text-primary">{insight.metric}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface InsightsPanelProps {
  insights: AIInsight[];
  loading?: boolean;
}

export function InsightsPanel({ insights, loading }: InsightsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-violet-400" />
        </div>
        <h3 className="text-sm font-semibold text-text-primary">Inteligencia Predictiva</h3>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
          IA
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-shimmer h-16 rounded-xl" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm text-text-secondary">Todo en orden. Sin alertas activas.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {insights.map((insight, i) => (
            <AIInsightCard key={insight.id} insight={insight} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
