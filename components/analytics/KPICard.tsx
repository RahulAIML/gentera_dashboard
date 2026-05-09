"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  delta?: number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
  accent?: "blue" | "violet" | "emerald" | "amber" | "cyan";
  index?: number;
}

const ACCENTS = {
  blue: {
    icon: "bg-brand-500/10 text-brand-400",
    glow: "from-brand-500/20 to-transparent",
    badge: "text-brand-400 bg-brand-500/10",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-400",
    glow: "from-violet-500/20 to-transparent",
    badge: "text-violet-400 bg-violet-500/10",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-400",
    glow: "from-emerald-500/20 to-transparent",
    badge: "text-emerald-400 bg-emerald-500/10",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-400",
    glow: "from-amber-500/20 to-transparent",
    badge: "text-amber-400 bg-amber-500/10",
  },
  cyan: {
    icon: "bg-cyan-500/10 text-cyan-400",
    glow: "from-cyan-500/20 to-transparent",
    badge: "text-cyan-400 bg-cyan-500/10",
  },
};

export function KPICard({
  title, value, subtitle, delta, icon: Icon, trend, loading, accent = "blue", index = 0,
}: KPICardProps) {
  const colors = ACCENTS[accent];

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5 h-[130px]">
        <div className="skeleton-shimmer h-4 w-24 rounded mb-3" />
        <div className="skeleton-shimmer h-8 w-32 rounded mb-2" />
        <div className="skeleton-shimmer h-3 w-20 rounded" />
      </div>
    );
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-text-muted";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
      className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-brand-500/30 transition-all duration-200"
    >
      {/* Background glow */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30 pointer-events-none", colors.glow)} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">{title}</p>
          <p className="text-2xl font-bold text-text-primary leading-none mb-1.5 tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3", colors.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {delta !== undefined && (
        <div className="relative flex items-center gap-1.5 mt-3">
          <TrendIcon className={cn("w-3.5 h-3.5", trendColor)} />
          <span className={cn("text-xs font-medium", trendColor)}>
            {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
          </span>
          <span className="text-xs text-text-muted">vs período anterior</span>
        </div>
      )}
    </motion.div>
  );
}
