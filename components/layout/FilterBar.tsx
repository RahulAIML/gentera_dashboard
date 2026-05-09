"use client";
import { useState } from "react";
import { format, subMonths, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Calendar, Filter, X, ChevronDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useFilterStore } from "@/lib/store/filterStore";
import { useActivities } from "@/hooks/useAnalyticsData";

const QUICK_RANGES = [
  { label: "7 días", getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: "30 días", getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: "3 meses", getValue: () => ({ start: subMonths(new Date(), 3), end: new Date() }) },
  { label: "6 meses", getValue: () => ({ start: subMonths(new Date(), 6), end: new Date() }) },
  { label: "Este mes", getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
];

function DatePickerInput({ value, onChange, placeholder }: {
  value: Date | null; onChange: (d: Date | null) => void; placeholder: string;
}) {
  const str = value ? format(value, "yyyy-MM-dd") : "";
  return (
    <input
      type="date"
      value={str}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v ? new Date(v + "T00:00:00") : null);
      }}
      placeholder={placeholder}
      className="bg-surface-700 border border-border text-text-primary text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500 transition-colors [color-scheme:dark] w-36"
    />
  );
}

export function FilterBar() {
  const { data: activities } = useActivities();
  const {
    dateRange, activityIds, diagnosisFilter,
    setDateRange, setActivityIds, setDiagnosisFilter, resetFilters,
  } = useFilterStore();
  const [showQuick, setShowQuick] = useState(false);

  const activeFilters = [
    dateRange.start || dateRange.end,
    activityIds.length > 0,
    diagnosisFilter !== "all",
  ].filter(Boolean).length;

  return (
    <div className="sticky top-0 z-20 bg-surface-800/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-3 px-6 py-3 overflow-x-auto">
        {/* Filter icon */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-text-muted" />
          <span className="text-sm font-medium text-text-secondary whitespace-nowrap">Filtros</span>
          {activeFilters > 0 && (
            <span className="text-[10px] bg-brand-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {activeFilters}
            </span>
          )}
        </div>

        <div className="w-px h-5 bg-border shrink-0" />

        {/* Date range */}
        <div className="flex items-center gap-2 shrink-0 relative">
          <Calendar className="w-4 h-4 text-text-muted" />
          <DatePickerInput
            value={dateRange.start}
            onChange={(d) => setDateRange(d, dateRange.end)}
            placeholder="Inicio"
          />
          <span className="text-text-muted text-sm">—</span>
          <DatePickerInput
            value={dateRange.end}
            onChange={(d) => setDateRange(dateRange.start, d)}
            placeholder="Fin"
          />
          <button
            onClick={() => setShowQuick(!showQuick)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-text-secondary border border-border rounded-lg hover:border-brand-500 hover:text-brand-400 transition-all"
          >
            Rápido <ChevronDown className="w-3 h-3" />
          </button>
          {showQuick && (
            <div className="absolute top-full left-0 mt-1 bg-surface-700 border border-border rounded-xl shadow-xl z-30 p-1.5 flex flex-col gap-0.5 min-w-[120px]">
              {QUICK_RANGES.map((r) => (
                <button
                  key={r.label}
                  onClick={() => { const v = r.getValue(); setDateRange(v.start, v.end); setShowQuick(false); }}
                  className="text-left text-xs px-3 py-1.5 rounded-lg text-text-secondary hover:bg-surface-600 hover:text-text-primary transition-colors whitespace-nowrap"
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-border shrink-0" />

        {/* Activity filter */}
        {activities && activities.length > 0 && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap max-w-lg">
            <span className="text-xs text-text-muted">Actividad:</span>
            <button
              onClick={() => setActivityIds([])}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-all",
                activityIds.length === 0
                  ? "bg-brand-500/20 border-brand-500 text-brand-400"
                  : "border-border text-text-muted hover:border-surface-300"
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
                  "text-xs px-2.5 py-1 rounded-full border transition-all max-w-[160px] truncate",
                  activityIds.includes(a.id)
                    ? "bg-brand-500/20 border-brand-500 text-brand-400"
                    : "border-border text-text-muted hover:border-surface-300"
                )}
                title={a.name}
              >
                {a.name.length > 22 ? a.name.slice(0, 22) + "…" : a.name}
              </button>
            ))}
          </div>
        )}

        <div className="w-px h-5 bg-border shrink-0" />

        {/* Diagnosis filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-text-muted">Diagnóstico:</span>
          {(["all", "passed", "failed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setDiagnosisFilter(f)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-all",
                diagnosisFilter === f
                  ? "bg-brand-500/20 border-brand-500 text-brand-400"
                  : "border-border text-text-muted hover:border-surface-300"
              )}
            >
              {f === "all" ? "Todos" : f === "passed" ? "Aprobados" : "No aprobados"}
            </button>
          ))}
        </div>

        {/* Reset */}
        {activeFilters > 0 && (
          <>
            <div className="w-px h-5 bg-border shrink-0" />
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
