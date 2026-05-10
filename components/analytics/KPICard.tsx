"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type KPIAccent = "amber" | "blue" | "violet" | "emerald" | "coral" | "cyan";

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
  iconBg: string; iconText: string; glow: string;
  badge: string; border: string; bar: string;
}> = {
  amber: {
    iconBg:   "bg-brand-500/10",
    iconText: "text-brand-400",
    glow:     "radial-gradient(ellipse at top left, rgba(245,158,11,0.12) 0%, transparent 60%)",
    badge:    "text-brand-400 bg-brand-500/10 border-brand-500/20",
    border:   "hover:border-brand-500/30",
    bar:      "from-brand-500 to-brand-400",
  },
  blue: {
    iconBg:   "bg-blue-500/10",
    iconText: "text-blue-400",
    glow:     "radial-gradient(ellipse at top left, rgba(14,165,233,0.12) 0%, transparent 60%)",
    badge:    "text-blue-400 bg-blue-500/10 border-blue-500/20",
    border:   "hover:border-blue-500/30",
    bar:      "from-blue-500 to-blue-400",
  },
  violet: {
    iconBg:   "bg-violet-500/10",
    iconText: "text-violet-400",
    glow:     "radial-gradient(ellipse at top left, rgba(139,92,246,0.12) 0%, transparent 60%)",
    badge:    "text-violet-400 bg-violet-500/10 border-violet-500/20",
    border:   "hover:border-violet-500/30",
    bar:      "from-violet-500 to-violet-400",
  },
  emerald: {
    iconBg:   "bg-emerald-500/10",
    iconText: "text-emerald-400",
    glow:     "radial-gradient(ellipse at top left, rgba(16,185,129,0.12) 0%, transparent 60%)",
    badge:    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    border:   "hover:border-emerald-500/30",
    bar:      "from-emerald-500 to-emerald-400",
  },
  coral: {
    iconBg:   "bg-coral-500/10",
    iconText: "text-coral-400",
    glow:     "radial-gradient(ellipse at top left, rgba(244,63,94,0.12) 0%, transparent 60%)",
    badge:    "text-coral-400 bg-coral-500/10 border-coral-500/20",
    border:   "hover:border-coral-500/30",
    bar:      "from-coral-500 to-coral-400",
  },
  cyan: {
    iconBg:   "bg-cyan-500/10",
    iconText: "text-cyan-400",
    glow:     "radial-gradient(ellipse at top left, rgba(6,182,212,0.12) 0%, transparent 60%)",
    badge:    "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    border:   "hover:border-cyan-500/30",
    bar:      "from-cyan-500 to-cyan-400",
  },
};

export function KPICard({
  title, value, subtitle, delta, trend, icon: Icon,
  accent = "amber", loading, index = 0,
}: KPICardProps) {
  const t = THEMES[accent];

  if (loading) {
    return (
      <div className="glass rounded-2xl p-5 h-32 space-y-3">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-7 w-28 rounded" />
        <div className="skeleton h-2.5 w-16 rounded" />
      </div>
    );
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendCls = trend === "up"
    ? "text-emerald-400"
    : trend === "down"
    ? "text-coral-400"
    : "text-text-muted";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "glass rounded-2xl p-5 relative overflow-hidden card-hover border border-border",
        t.border,
        "group cursor-default"
      )}
    >
      {/* Ambient gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: t.glow }}
      />

      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5 pointer-events-none overflow-hidden rounded-2xl">
        <Icon className="w-20 h-20 absolute -right-4 -top-4" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">{title}</p>
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", t.iconBg)}>
            <Icon className={cn("w-4 h-4", t.iconText)} />
          </div>
        </div>

        <div className="mb-1">
          <span className="text-2xl font-black text-text-primary tabular-nums tracking-tight count-enter">
            {value}
          </span>
        </div>

        {subtitle && (
          <p className="text-xs text-text-muted">{subtitle}</p>
        )}

        {delta !== undefined && (
          <div className="flex items-center gap-1.5 mt-3">
            <TrendIcon className={cn("w-3 h-3", trendCls)} />
            <span className={cn("text-[11px] font-bold", trendCls)}>
              {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
            </span>
            <span className="text-[10px] text-text-disabled">vs anterior</span>
          </div>
        )}
      </div>

      {/* Bottom accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className={cn("h-full bg-gradient-to-r", t.bar)} />
      </div>
    </motion.div>
  );
}
