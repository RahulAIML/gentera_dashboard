"use client";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Target, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FunnelData {
  round: number;
  passRate: number;
  totalApplicable: number;
  label: string;
}

interface ExecutiveFunnelChartProps {
  data: FunnelData[];
  title: string;
  subtitle?: string;
  className?: string;
  height?: number;
  showThreshold?: boolean;
  threshold?: number;
}

export function ExecutiveFunnelChart({
  data,
  title,
  subtitle,
  className,
  height = 240,
  showThreshold = true,
  threshold = 70,
}: ExecutiveFunnelChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      displayRate: item.passRate.toFixed(1),
      color: item.passRate >= threshold ? "#10b981" : 
             item.passRate >= threshold * 0.8 ? "#f59e0b" : "#f43f5e",
      status: item.passRate >= threshold ? "good" : 
              item.passRate >= threshold * 0.8 ? "warning" : "critical",
    }));
  }, [data, threshold]);

  const overallRate = useMemo(() => {
    if (chartData.length === 0) return 0;
    return chartData.reduce((sum, item) => sum + item.passRate, 0) / chartData.length;
  }, [chartData]);

  const criticalPoints = useMemo(() => {
    return chartData.filter(item => item.status === "critical").length;
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-surface-900/95 backdrop-blur-xl border border-surface-700/60 rounded-xl p-4 shadow-xl">
        <div className="text-sm font-medium text-surface-200 mb-2">
          {data.label}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-surface-400">Pass Rate</span>
            <span className={cn(
              "text-sm font-semibold",
              data.status === "good" && "text-emerald-400",
              data.status === "warning" && "text-amber-400",
              data.status === "critical" && "text-rose-400"
            )}>
              {data.passRate.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-surface-400">Total</span>
            <span className="text-sm font-semibold text-surface-200">
              {data.totalApplicable.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-emerald-400";
      case "warning": return "text-amber-400";
      case "critical": return "text-rose-400";
      default: return "text-surface-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "good": return "bg-emerald-500/10 border-emerald-500/30";
      case "warning": return "bg-amber-500/10 border-amber-500/30";
      case "critical": return "bg-rose-500/10 border-rose-500/30";
      default: return "bg-surface-700/30 border-surface-600/30";
    }
  };

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
        
        {/* Status Indicator */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
          getStatusBg(criticalPoints === 0 ? "good" : criticalPoints <= 2 ? "warning" : "critical")
        )}>
          {criticalPoints === 0 ? (
            <Target className="w-4 h-4 text-emerald-400" />
          ) : criticalPoints <= 2 ? (
            <TrendingUp className="w-4 h-4 text-amber-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span className={cn(
            "text-xs font-semibold",
            getStatusColor(criticalPoints === 0 ? "good" : criticalPoints <= 2 ? "warning" : "critical")
          )}>
            {criticalPoints === 0 ? "On Track" : `${criticalPoints} Critical`}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            layout="horizontal"
          >
            <CartesianGrid 
              strokeDasharray="2 2" 
              stroke="#1e293b20" 
              vertical={true}
              horizontal={false}
            />
            <XAxis 
              type="number"
              domain={[0, 100]}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b" }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              type="category"
              dataKey="label"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b" }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Threshold Line */}
            {showThreshold && (
              <Bar
                dataKey={threshold}
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                opacity={0.5}
              />
            )}
            
            {/* Main Bars */}
            <Bar
              dataKey="passRate"
              radius={[0, 8, 8, 0]}
              maxBarSize={40}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-surface-700/30">
        <div className="text-center">
          <div className="text-xs text-surface-500 mb-1">Overall Rate</div>
          <div className={cn(
            "text-sm font-semibold",
            overallRate >= threshold ? "text-emerald-400" :
            overallRate >= threshold * 0.8 ? "text-amber-400" : "text-rose-400"
          )}>
            {overallRate.toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-surface-500 mb-1">Best Round</div>
          <div className="text-sm font-semibold text-emerald-400">
            {chartData.length > 0 
              ? Math.max(...chartData.map(item => item.passRate)).toFixed(1) + "%"
              : "—"
            }
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-surface-500 mb-1">Needs Focus</div>
          <div className="text-sm font-semibold text-rose-400">
            {criticalPoints}
          </div>
        </div>
      </div>

      {/* Threshold Legend */}
      {showThreshold && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-surface-500">Target: {threshold}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
