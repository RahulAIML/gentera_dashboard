"use client";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { TooltipContentProps } from "recharts";
import type { ScoreDistributionBucket } from "@/types/analytics";
import { useI18n } from "@/lib/i18n";
import type { Dict } from "@/lib/i18n/locales/es";

const COLORS = ["#fb7185", "#fbbf24", "#818cf8", "#60a5fa", "#34d399"];

type TipProps = TooltipContentProps<number, string> & { t: Dict };

function Tip({ active, payload, t }: TipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item || typeof item !== "object") return null;
  const d = item as ScoreDistributionBucket;
  return (
    <div className="bg-surface-750 border border-border-strong rounded-xl p-3 shadow-2xl">
      <p className="text-[11px] font-bold text-text-primary mb-2">{t.charts.rangeLabel} {d.range}</p>
      <div className="flex justify-between gap-4 text-xs">
        <span className="text-text-muted">{t.charts.simulationsLabel}</span>
        <span className="font-mono font-bold text-text-primary">{d.count}</span>
      </div>
      <div className="flex justify-between gap-4 text-xs">
        <span className="text-text-muted">{t.charts.percentageLabel}</span>
        <span className="font-mono font-bold text-brand-400">{(d.percentage * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}

export function ScoreDistribution({ data, loading }: { data: ScoreDistributionBucket[]; loading?: boolean }) {
  const { t } = useI18n();
  if (loading) {
    return (
      <div className="glass rounded-2xl p-5 h-[260px]">
        <div className="skeleton h-4 w-40 rounded mb-2" />
        <div className="skeleton h-3 w-60 rounded mb-6" />
        <div className="skeleton rounded-xl h-[160px]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="glass rounded-2xl p-5"
    >
      <div className="mb-5">
        <h3 className="text-sm font-bold text-text-primary">{t.charts.scoreDistribution}</h3>
        <p className="text-[11px] text-text-muted mt-0.5">{t.charts.scoreDistSub}</p>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="range" tick={{ fill: "#6b6f8e", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#6b6f8e", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={(props) => <Tip {...(props as any)} t={t} />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={52}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i]} fillOpacity={0.85} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Mini legend */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        {data.map((d, i) => (
          <div key={d.range} className="flex flex-col items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
            <span className="text-[9px] text-text-disabled">{d.range}</span>
            <span className="text-[10px] font-bold" style={{ color: COLORS[i] }}>{d.count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
