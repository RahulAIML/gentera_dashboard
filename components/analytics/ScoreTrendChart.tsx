"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import type { TrendDataPoint } from "@/types/analytics";
import { useI18n } from "@/lib/i18n";
import type { Dict } from "@/lib/i18n/locales/es";

interface Props { data: TrendDataPoint[]; loading?: boolean; }

type TrendTooltipProps = TooltipContentProps<number, string> & { t: Dict };

function CustomTooltip({ active, payload, label, t }: TrendTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-750 border border-border-strong rounded-xl p-3.5 shadow-2xl min-w-[190px]">
      <p className="text-xs font-bold text-text-primary mb-2.5 capitalize">{label}</p>
      {payload.map((p) => {
        const dataKey = typeof p.dataKey === "string" ? p.dataKey : String(p.dataKey ?? "");
        const color = p.color ?? "#818cf8";
        const rawValue = p.value;
        const num = typeof rawValue === "number" ? rawValue : Number(rawValue);
        const display = dataKey === "simulations"
          ? String(Number.isFinite(num) ? num : rawValue ?? "")
          : `${(Number.isFinite(num) ? num : 0).toFixed(0)}%`;

        return (
          <div key={dataKey} className="flex items-center justify-between gap-4 text-xs mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-text-muted">
              {dataKey === "passRate100" ? t.charts.passRateLabel :
               dataKey === "averageScore" ? t.charts.avgScoreLabel : t.charts.simulationsLabel}
            </span>
          </div>
          <span className="font-mono font-bold text-text-primary">
            {display}
          </span>
        </div>
        );
      })}
    </div>
  );
}

export function ScoreTrendChart({ data, loading }: Props) {
  const { t } = useI18n();
  const chartData = data.map((d) => ({ ...d, passRate100: d.passRate * 100 }));

  if (loading) {
    return (
      <div className="glass rounded-2xl p-5 h-[310px]">
        <div className="skeleton h-4 w-44 rounded mb-2" />
        <div className="skeleton h-3 w-64 rounded mb-6" />
        <div className="skeleton rounded-xl h-[220px]" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="glass rounded-2xl p-5 h-[310px] flex flex-col items-center justify-center gap-3">
        <TrendingUp className="w-8 h-8 text-text-disabled" />
        <p className="text-sm text-text-muted">{t.charts.noDataPeriod}</p>
        <p className="text-xs text-text-disabled">{t.charts.adjustFilters}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-text-primary">{t.charts.scoreTrend}</h3>
          <p className="text-[11px] text-text-muted mt-0.5">{t.charts.scoreTrendSub}</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-800 border border-border">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
          <span className="text-[10px] text-text-muted">{data.length} {t.charts.periodsLabel}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={228}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="gScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#818cf8" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#818cf8" stopOpacity={0.0}  />
            </linearGradient>
            <linearGradient id="gPass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#10b981" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.0}  />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#6b6f8e", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#6b6f8e", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={(props) => <CustomTooltip {...props} t={t} />} />
          <Legend
            wrapperStyle={{ fontSize: 10, color: "#a8aac8", paddingTop: 10 }}
            formatter={(v) =>
              v === "averageScore" ? t.charts.avgScoreLabel :
              v === "passRate100"  ? t.charts.passRateLabel : v
            }
          />
          <ReferenceLine y={60} stroke="#6366f1" strokeDasharray="4 4" strokeOpacity={0.25} />
          <Area type="monotone" dataKey="averageScore" stroke="#818cf8" strokeWidth={2} fill="url(#gScore)" dot={false} activeDot={{ r: 4, fill: "#818cf8", stroke: "#0d0f1a", strokeWidth: 2 }} />
          <Area type="monotone" dataKey="passRate100"  stroke="#10b981" strokeWidth={2} fill="url(#gPass)"  dot={false} activeDot={{ r: 4, fill: "#10b981", stroke: "#0d0f1a", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
