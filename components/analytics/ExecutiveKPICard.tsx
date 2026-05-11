"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";

export type KPIAccent = "brand" | "emerald" | "amber" | "rose" | "blue" | "violet" | "cyan";

interface ExecutiveKPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  delta?: number;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  accent?: KPIAccent;
  loading?: boolean;
  index?: number;
  description?: string;
  size?: "compact" | "default" | "large";
}

const ACCENT_THEMES: Record<KPIAccent, {
  bg: string;
  iconBg: string;
  iconText: string;
  trendUp: string;
  trendDown: string;
  border: string;
  glow: string;
}> = {
  brand: {
    bg: "rgba(99, 102, 241, 0.08)",
    iconBg: "rgba(99, 102, 241, 0.15)",
    iconText: "rgb(129, 140, 248)",
    trendUp: "rgb(34, 197, 94)",
    trendDown: "rgb(239, 68, 68)",
    border: "rgba(99, 102, 241, 0.2)",
    glow: "rgba(99, 102, 241, 0.1)",
  },
  emerald: {
    bg: "rgba(16, 185, 129, 0.08)",
    iconBg: "rgba(16, 185, 129, 0.15)",
    iconText: "rgb(52, 211, 153)",
    trendUp: "rgb(34, 197, 94)",
    trendDown: "rgb(239, 68, 68)",
    border: "rgba(16, 185, 129, 0.2)",
    glow: "rgba(16, 185, 129, 0.1)",
  },
  amber: {
    bg: "rgba(245, 158, 11, 0.08)",
    iconBg: "rgba(245, 158, 11, 0.15)",
    iconText: "rgb(251, 191, 36)",
    trendUp: "rgb(34, 197, 94)",
    trendDown: "rgb(239, 68, 68)",
    border: "rgba(245, 158, 11, 0.2)",
    glow: "rgba(245, 158, 11, 0.1)",
  },
  rose: {
    bg: "rgba(244, 63, 94, 0.08)",
    iconBg: "rgba(244, 63, 94, 0.15)",
    iconText: "rgb(251, 113, 133)",
    trendUp: "rgb(34, 197, 94)",
    trendDown: "rgb(239, 68, 68)",
    border: "rgba(244, 63, 94, 0.2)",
    glow: "rgba(244, 63, 94, 0.1)",
  },
  blue: {
    bg: "rgba(59, 130, 246, 0.08)",
    iconBg: "rgba(59, 130, 246, 0.15)",
    iconText: "rgb(96, 165, 250)",
    trendUp: "rgb(34, 197, 94)",
    trendDown: "rgb(239, 68, 68)",
    border: "rgba(59, 130, 246, 0.2)",
    glow: "rgba(59, 130, 246, 0.1)",
  },
  violet: {
    bg: "rgba(139, 92, 246, 0.08)",
    iconBg: "rgba(139, 92, 246, 0.15)",
    iconText: "rgb(167, 139, 250)",
    trendUp: "rgb(34, 197, 94)",
    trendDown: "rgb(239, 68, 68)",
    border: "rgba(139, 92, 246, 0.2)",
    glow: "rgba(139, 92, 246, 0.1)",
  },
  cyan: {
    bg: "rgba(6, 182, 212, 0.08)",
    iconBg: "rgba(6, 182, 212, 0.15)",
    iconText: "rgb(34, 211, 238)",
    trendUp: "rgb(34, 197, 94)",
    trendDown: "rgb(239, 68, 68)",
    border: "rgba(6, 182, 212, 0.2)",
    glow: "rgba(6, 182, 212, 0.1)",
  },
};

export function ExecutiveKPICard({
  title,
  value,
  subtitle,
  delta,
  trend,
  icon: Icon,
  accent = "brand",
  loading = false,
  index = 0,
  description,
  size = "default",
}: ExecutiveKPICardProps) {
  const { t } = useI18n();
  const theme = ACCENT_THEMES[accent];

  if (loading) {
    return (
      <div 
        className={cn(
          "relative overflow-hidden rounded-2xl border transition-all duration-300",
          size === "compact" ? "p-4 h-20" : size === "large" ? "p-8 h-32" : "p-6 h-28",
          "bg-surface-800/50 border-surface-700/50"
        )}
      >
        <div className="space-y-3">
          <div className="skeleton h-3 w-24 rounded-lg" />
          <div className="skeleton h-8 w-32 rounded-lg" />
          <div className="skeleton h-2 w-16 rounded-lg" />
        </div>
      </div>
    );
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? theme.trendUp : trend === "down" ? theme.trendDown : "rgb(148, 163, 184)";

  const sizeClasses = {
    compact: "p-4 h-20",
    default: "p-6 h-28",
    large: "p-8 h-32"
  };

  const valueSizes = {
    compact: "text-2xl",
    default: "text-3xl",
    large: "text-4xl"
  };

  const iconSizes = {
    compact: "w-4 h-4",
    default: "w-5 h-5",
    large: "w-6 h-6"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ 
        y: -6,
        scale: 1.02,
        transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      className={cn(
        "relative group cursor-pointer",
        "bg-surface-800/60 backdrop-blur-sm border border-surface-700/60 rounded-2xl p-4 sm:p-6",
        "hover:bg-surface-750/80 hover:border-surface-600/80 hover:shadow-2xl",
        "transition-all duration-300 ease-out",
        "overflow-hidden",
        "min-h-[120px] sm:min-h-[140px]",
        "gpu-accelerated",
        "hover-lift",
        "card-entrance",
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${theme.bg} 0%, transparent 100%)`,
        borderColor: theme.border,
      }}
    >
      {/* Ambient glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${theme.glow} 0%, transparent 70%)`,
        }}
      />

      <div className="relative h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-surface-200 leading-tight mb-1">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-surface-400 leading-relaxed line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <div 
            className={cn(
              "flex items-center justify-center rounded-xl transition-all duration-300",
              size === "compact" ? "w-8 h-8" : size === "large" ? "w-12 h-12" : "w-10 h-10",
              theme.iconBg
            )}
          >
            <Icon className={cn(iconSizes[size], theme.iconText)} strokeWidth={2} />
          </div>
        </div>

        {/* Value */}
        <div className="mt-2">
          <div className={cn(
            "font-bold tabular-nums leading-tight text-surface-50",
            valueSizes[size]
          )}>
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-surface-400 mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Trend indicator */}
        {delta !== undefined && (
          <div className="flex items-center gap-1.5 mt-3">
            <div className="flex items-center gap-1">
              <TrendIcon 
                className={cn("w-3 h-3", trend === "neutral" && "opacity-50")} 
                style={{ color: trendColor }}
                strokeWidth={2}
              />
              <span 
                className="text-xs font-semibold tabular-nums"
                style={{ color: trendColor }}
              >
                {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
              </span>
            </div>
            <span className="text-xs text-surface-500">
              {t.ai.vsPrevious}
            </span>
          </div>
        )}
      </div>

      {/* Interactive border accent */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${theme.iconText} 50%, transparent 100%)`,
        }}
      />
    </motion.div>
  );
}
