"use client";
import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TrendData {
  period: string;
  label: string;
  simulations: number;
  averageScore: number;
  passRate: number;
  uniqueUsers: number;
}

interface ExecutiveTrendChartProps {
  data: TrendData[];
  metric: "simulations" | "averageScore" | "passRate" | "uniqueUsers";
  title: string;
  subtitle?: string;
  className?: string;
  height?: number;
  showArea?: boolean;
  accentColor?: "brand" | "emerald" | "amber" | "rose" | "violet";
}

export function ExecutiveTrendChart({
  data,
  metric,
  title,
  subtitle,
  className,
  height = 240,
  showArea = false,
  accentColor = "brand",
}: ExecutiveTrendChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      value: item[metric],
      displayValue: item[metric].toFixed(metric === "passRate" ? 1 : 0),
    }));
  }, [data, metric]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return { direction: "neutral", change: 0 };
    const recent = chartData[chartData.length - 1].value;
    const previous = chartData[chartData.length - 2].value;
    const change = ((recent - previous) / previous) * 100;
    return {
      direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
      change: Math.abs(change),
    };
  }, [chartData]);

  const colorSchemes = {
    brand: {
      stroke: "#3b82f6",
      fill: "#3b82f620",
      grid: "#1e293b20",
      text: "#64748b",
    },
    emerald: {
      stroke: "#10b981",
      fill: "#10b98120",
      grid: "#1e293b20",
      text: "#64748b",
    },
    amber: {
      stroke: "#f59e0b",
      fill: "#f59e0b20",
      grid: "#1e293b20",
      text: "#64748b",
    },
    rose: {
      stroke: "#f43f5e",
      fill: "#f43f5e20",
      grid: "#1e293b20",
      text: "#64748b",
    },
    violet: {
      stroke: "#8b5cf6",
      fill: "#8b5cf620",
      grid: "#1e293b20",
      text: "#64748b",
    },
  };

  const colors = colorSchemes[accentColor];

  const formatValue = (value: number) => {
    switch (metric) {
      case "passRate":
        return `${value.toFixed(1)}%`;
      case "averageScore":
        return value.toFixed(1);
      default:
        return value.toLocaleString();
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-surface-900/95 backdrop-blur-xl border border-surface-700/60 rounded-xl p-4 shadow-xl">
        <div className="text-sm font-medium text-surface-200 mb-2">
          {label}
        </div>
        <div className="text-lg font-semibold text-surface-50">
          {formatValue(payload[0].value)}
        </div>
        {metric === "simulations" && payload[0].payload.uniqueUsers > 0 && (
          <div className="text-xs text-surface-400 mt-1">
            {payload[0].payload.uniqueUsers} users
          </div>
        )}
      </div>
    );
  };

  const TrendIcon = trend.direction === "up" ? TrendingUp : 
                   trend.direction === "down" ? TrendingDown : Minus;

  return (
    <div className={cn("bg-surface-800/40 backdrop-blur-sm border border-surface-700/50 rounded-2xl p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-surface-200 leading-tight mb-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-surface-400 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Trend Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-900/60 border border-surface-700/40">
          <TrendIcon className={cn(
            "w-4 h-4",
            trend.direction === "up" && "text-emerald-400",
            trend.direction === "down" && "text-rose-400",
            trend.direction === "neutral" && "text-surface-500"
          )} />
          <span className={cn(
            "text-xs font-semibold",
            trend.direction === "up" && "text-emerald-400",
            trend.direction === "down" && "text-rose-400",
            trend.direction === "neutral" && "text-surface-500"
          )}>
            {trend.change.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {showArea ? (
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${accentColor}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.stroke} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.stroke} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="2 2" 
                stroke={colors.grid} 
                vertical={false}
              />
              <XAxis 
                dataKey="label" 
                stroke={colors.text}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: colors.text }}
              />
              <YAxis 
                stroke={colors.text}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: colors.text }}
                tickFormatter={formatValue}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.stroke}
                strokeWidth={2}
                fill={`url(#gradient-${accentColor})`}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: colors.stroke,
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="2 2" 
                stroke={colors.grid} 
                vertical={false}
              />
              <XAxis 
                dataKey="label" 
                stroke={colors.text}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: colors.text }}
              />
              <YAxis 
                stroke={colors.text}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: colors.text }}
                tickFormatter={formatValue}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors.stroke}
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: colors.stroke,
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-surface-700/30">
        <div className="text-center">
          <div className="text-xs text-surface-500 mb-1">Current</div>
          <div className="text-sm font-semibold text-surface-200">
            {chartData.length > 0 ? formatValue(chartData[chartData.length - 1].value) : "—"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-surface-500 mb-1">Average</div>
          <div className="text-sm font-semibold text-surface-200">
            {chartData.length > 0 
              ? formatValue(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length)
              : "—"
            }
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-surface-500 mb-1">Peak</div>
          <div className="text-sm font-semibold text-surface-200">
            {chartData.length > 0 
              ? formatValue(Math.max(...chartData.map(item => item.value)))
              : "—"
            }
          </div>
        </div>
      </div>
    </div>
  );
}
