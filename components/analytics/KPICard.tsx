"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type KPIAccent = "brand" | "amber" | "blue" | "violet" | "emerald" | "rose" | "coral" | "cyan";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  delta?: number;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  accent?: KPIAccent;
  loading?: boolean;
  index?: number;
}

const THEMES: Record<KPIAccent, {
  iconBg: string;
  iconText: string;
  bar: string;
  ambientColor: string;
}> = {
  brand: {
    iconBg:       "bg-brand-500/10",
    iconText:     "text-brand-400",
    bar:          "from-brand-500 to-brand-400",
    ambientColor: "rgba(99,102,241,0.06)",
  },
  amber: {
    iconBg:       "bg-amber-500/10",
    iconText:     "text-amber-400",
    bar:          "from-amber-500 to-amber-400",
    ambientColor: "rgba(245,158,11,0.06)",
  },
  blue: {
    iconBg:       "bg-blue-500/10",
    iconText:     "text-blue-400",
    bar:          "from-blue-500 to-blue-400",
    ambientColor: "rgba(59,130,246,0.06)",
  },
  violet: {
    iconBg:       "bg-violet-500/10",
    iconText:     "text-violet-400",
    bar:          "from-violet-500 to-violet-400",
    ambientColor: "rgba(139,92,246,0.06)",
  },
  emerald: {
    iconBg:       "bg-emerald-500/10",
    iconText:     "text-emerald-400",
    bar:          "from-emerald-500 to-emerald-400",
    ambientColor: "rgba(16,185,129,0.06)",
  },
  rose: {
    iconBg:       "bg-rose-500/10",
    iconText:     "text-rose-400",
    bar:          "from-rose-500 to-rose-400",
    ambientColor: "rgba(244,63,94,0.06)",
  },
  coral: {
    iconBg:       "bg-rose-500/10",
    iconText:     "text-rose-400",
    bar:          "from-rose-500 to-rose-400",
    ambientColor: "rgba(244,63,94,0.06)",
  },
  cyan: {
    iconBg:       "bg-cyan-500/10",
    iconText:     "text-cyan-400",
    bar:          "from-cyan-500 to-cyan-400",
    ambientColor: "rgba(6,182,212,0.06)",
  },
};

export function KPICard({
  title, value, subtitle, delta, trend, icon: Icon,
  accent = "brand", loading, index = 0,
}: KPICardProps) {
  const th = THEMES[accent];

  if (loading) {
    return (
      <div className="glass rounded-xl p-5 h-[108px] space-y-3 border border-border">
        <div className="skeleton h-2.5 w-20 rounded" />
        <div className="skeleton h-7 w-28 rounded" />
        <div className="skeleton h-2 w-16 rounded" />
      </div>
    );
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"   ? "text-emerald-400" :
    trend === "down" ? "text-rose-400"    : "text-text-muted";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
      className="glass rounded-xl p-5 relative overflow-hidden card-hover border border-border group cursor-default"
    >
      {/* Subtle ambient tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${th.ambientColor} 0%, transparent 60%)`,
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">{title}</p>
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", th.iconBg)}>
            <Icon className={cn("w-3.5 h-3.5", th.iconText)} />
          </div>
        </div>

        <div className="mb-0.5">
          <span className="text-2xl font-bold text-text-primary tabular-nums tracking-tight count-enter">
            {value}
          </span>
        </div>

        {subtitle && (
          <p className="text-xs text-text-muted">{subtitle}</p>
        )}

        {delta !== undefined && (
          <div className="flex items-center gap-1 mt-2.5">
            <TrendIcon className={cn("w-3 h-3", trendColor)} />
            <span className={cn("text-[11px] font-semibold", trendColor)}>
              {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
            </span>
            <span className="text-[10px] text-text-disabled">vs anterior</span>
          </div>
        )}
      </div>

      {/* Bottom accent bar on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
        <div className={cn("h-full bg-gradient-to-r", th.bar)} />
      </div>
    </motion.div>
  );
}
