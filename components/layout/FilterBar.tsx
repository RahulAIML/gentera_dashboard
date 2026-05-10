"use client";
import { useState } from "react";
import { format, subMonths, subDays, startOfMonth, endOfMonth, endOfDay } from "date-fns";
import { SlidersHorizontal, X, ChevronDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useFilterStore } from "@/lib/store/filterStore";
import { useActivities } from "@/hooks/useAnalyticsData";

const QUICK = [
  { label: "7d",  get: () => ({ start: subDays(new Date(), 7), end: endOfDay(new Date()) }) },
  { label: "30d", get: () => ({ start: subDays(new Date(), 30), end: endOfDay(new Date()) }) },
  { label: "3m",  get: () => ({ start: subMonths(new Date(), 3), end: endOfDay(new Date()) }) },
  { label: "6m",  get: () => ({ start: subMonths(new Date(), 6), end: endOfDay(new Date()) }) },
  { label: "Este mes", get: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  { label: "Todo", get: () => ({ start: null, end: null }) },
];

export function FilterBar() {
  const { data: activities } = useActivities();
  const {
    dateRange, activityIds, diagnosisFilter,
    setDateRange, setActivityIds, setDiagnosisFilter, resetFilters,
  } = useFilterStore();
  const [showQuick, setShowQuick] = useState(false);

  const activeCount = [
    dateRange.start || dateRange.end,
    activityIds.length > 0,
    diagnosisFilter !== "all",
  ].filter(Boolean).length;

  function dateStr(d: Date | null) {
    return d ? format(d, "dd/MM/yy") : "";
  }

  return (
    <div className="border-b border-border bg-surface-900/95 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center gap-2 px-5 py-2.5 overflow-x-auto scrollbar-none">
        {/* Icon */}
        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-text-muted" />
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>

        <div className="w-px h-4 bg-border shrink-0" />

        {/* Date range with quick presets */}
        <div className="relative flex items-center gap-1.5 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-800 border border-border text-xs text-text-secondary">
            <input
              type="date"
              value={dateRange.start ? format(dateRange.start, "yyyy-MM-dd") : ""}
              onChange={(e) => setDateRange(e.target.value ? new Date(e.target.value + "T00:00:00") : null, dateRange.end)}
              className="bg-transparent outline-none w-28 text-xs [color-scheme:dark]"
            />
            <span className="text-text-disabled">—</span>
            <input
              type="date"
              value={dateRange.end ? format(dateRange.end, "yyyy-MM-dd") : ""}
              onChange={(e) => setDateRange(dateRange.start, e.target.value ? new Date(e.target.value + "T23:59:59") : null)}
              className="bg-transparent outline-none w-28 text-xs [color-scheme:dark]"
            />
          </div>

          <button
            onClick={() => setShowQuick(!showQuick)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border text-[11px] text-text-muted hover:text-brand-400 hover:border-brand-500/40 transition-all bg-surface-800"
          >
            Rápido <ChevronDown className="w-3 h-3" />
          </button>

          {showQuick && (
            <div className="absolute top-full left-0 mt-1.5 bg-surface-750 border border-border-strong rounded-xl shadow-2xl z-50 p-1 flex flex-col min-w-[120px]">
              {QUICK.map((q) => (
                <button
                  key={q.label}
                  onClick={() => { const v = q.get(); setDateRange(v.start, v.end); setShowQuick(false); }}
                  className="text-left text-xs px-3 py-2 rounded-lg text-text-secondary hover:bg-surface-600 hover:text-brand-400 transition-colors whitespace-nowrap"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-border shrink-0" />

        {/* Activity chips */}
        {activities && activities.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <span className="text-[10px] text-text-disabled uppercase tracking-wider font-semibold">Actividad:</span>
            <button
              onClick={() => setActivityIds([])}
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-full border transition-all font-medium",
                activityIds.length === 0
                  ? "bg-brand-500/15 border-brand-500/50 text-brand-400"
                  : "border-border text-text-muted hover:border-border-strong hover:text-text-secondary"
              )}
            >
              Todas
            </button>
            {activities.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  const next = activityIds.includes(a.id)
                    ? activityIds.filter((x) => x !== a.id)
                    : [...activityIds, a.id];
                  setActivityIds(next);
                }}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-full border transition-all font-medium max-w-[160px] truncate",
                  activityIds.includes(a.id)
                    ? "bg-brand-500/15 border-brand-500/50 text-brand-400"
                    : "border-border text-text-muted hover:border-border-strong hover:text-text-secondary"
                )}
                title={a.name}
              >
                {a.name.length > 20 ? a.name.slice(0, 20) + "…" : a.name}
              </button>
            ))}
          </div>
        )}

        <div className="w-px h-4 bg-border shrink-0" />

        {/* Diagnosis */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-text-disabled uppercase tracking-wider font-semibold">Resultado:</span>
          {(["all", "passed", "failed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setDiagnosisFilter(f)}
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-full border transition-all font-medium",
                diagnosisFilter === f
                  ? f === "passed"
                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                    : f === "failed"
                    ? "bg-coral-500/15 border-coral-500/50 text-coral-400"
                    : "bg-brand-500/15 border-brand-500/50 text-brand-400"
                  : "border-border text-text-muted hover:border-border-strong hover:text-text-secondary"
              )}
            >
              {f === "all" ? "Todos" : f === "passed" ? "✓ Aprobados" : "✗ No aprobados"}
            </button>
          ))}
        </div>

        {/* Reset */}
        {activeCount > 0 && (
          <>
            <div className="w-px h-4 bg-border shrink-0" />
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-[11px] text-coral-400 hover:text-coral-300 transition-colors shrink-0 font-medium"
            >
              <X className="w-3 h-3" /> Limpiar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
