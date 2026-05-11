"use client";
import { useState } from "react";
import { format, subMonths, subDays, startOfMonth, endOfMonth, endOfDay } from "date-fns";
import { SlidersHorizontal, X, ChevronDown, Calendar, Check } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils/cn";
import { useFilterStore } from "@/lib/store/filterStore";
import { useActivities } from "@/hooks/useAnalyticsData";
import { useI18n } from "@/lib/i18n";
import { ScopeSelector } from "@/components/layout/ScopeSelector";

const QUICK_ES = [
  { labelKey: "last7d",    get: () => ({ start: subDays(new Date(), 7),    end: endOfDay(new Date()) }) },
  { labelKey: "last30d",   get: () => ({ start: subDays(new Date(), 30),   end: endOfDay(new Date()) }) },
  { labelKey: "last3m",    get: () => ({ start: subMonths(new Date(), 3),  end: endOfDay(new Date()) }) },
  { labelKey: "last6m",    get: () => ({ start: subMonths(new Date(), 6),  end: endOfDay(new Date()) }) },
  { labelKey: "thisMonth", get: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  { labelKey: "allTime",   get: () => ({ start: null, end: null }) },
] as const;

export function FilterBar() {
  const { data: activities } = useActivities();
  const {
    dateRange, activityIds, diagnosisFilter,
    setDateRange, setActivityIds, setDiagnosisFilter, resetFilters,
  } = useFilterStore();
  const [showQuick, setShowQuick] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const { t } = useI18n();

  const activeCount = [
    dateRange.start || dateRange.end,
    activityIds.length > 0,
    diagnosisFilter !== "all",
  ].filter(Boolean).length;

  return (
    <div className="border-b border-border bg-surface-800/95 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-4 py-2.5 max-w-[1480px] mx-auto">

        {/* Scope (role hierarchy) selector */}
        <ScopeSelector />

        <div className="w-px h-4 bg-border shrink-0" />

        {/* Date range */}
        <div className="relative flex items-center gap-1.5 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-700 border border-border/80 text-xs text-text-secondary">
            <input
              type="date"
              value={dateRange.start ? format(dateRange.start, "yyyy-MM-dd") : ""}
              onChange={(e) =>
                setDateRange(
                  e.target.value ? new Date(e.target.value + "T00:00:00") : null,
                  dateRange.end
                )
              }
              className="bg-transparent outline-none w-28 text-xs [color-scheme:dark]"
            />
            <span className="text-text-disabled">—</span>
            <input
              type="date"
              value={dateRange.end ? format(dateRange.end, "yyyy-MM-dd") : ""}
              onChange={(e) =>
                setDateRange(
                  dateRange.start,
                  e.target.value ? new Date(e.target.value + "T23:59:59") : null
                )
              }
              className="bg-transparent outline-none w-28 text-xs [color-scheme:dark]"
            />
          </div>

          <button
            onClick={() => setShowQuick(!showQuick)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border/80 text-[11px] text-text-muted hover:text-brand-400 hover:border-brand-500/50 transition-all bg-surface-700"
          >
            {t.filters.quick} <ChevronDown className="w-3 h-3" />
          </button>

          {showQuick && (
            <div className="absolute top-full left-0 mt-1.5 bg-surface-700 border border-border-strong rounded-xl shadow-2xl z-50 p-1 flex flex-col min-w-[150px]">
              {QUICK_ES.map((q) => (
                <button
                  key={q.labelKey}
                  onClick={() => {
                    const v = q.get();
                    setDateRange(v.start, v.end);
                    setShowQuick(false);
                  }}
                  className="text-left text-xs px-3 py-2 rounded-lg text-text-secondary hover:bg-surface-600 hover:text-brand-400 transition-colors whitespace-nowrap"
                >
                  {t.filters.presets[q.labelKey]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-border shrink-0" />

        {/* Filter popover (activities + diagnosis) */}
        <Popover.Root open={openFilters} onOpenChange={setOpenFilters}>
          <Popover.Trigger asChild>
            <button
              className={cn(
                "h-8 px-3 rounded-lg flex items-center gap-2 transition-colors shrink-0",
                "bg-surface-700/80 border border-border/80 hover:border-brand-500/50",
                openFilters && "border-brand-500/60 bg-surface-600",
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-[11px] font-medium text-text-secondary">
                {t.filters.activities} · {t.filters.diagnosis}
              </span>
              {activeCount > 0 && (
                <span className="ml-0.5 w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              sideOffset={10}
              align="start"
              className="z-50 w-[360px] max-w-[calc(100vw-24px)] rounded-2xl border border-border-strong bg-surface-750 shadow-2xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="text-[11px] font-semibold text-text-primary">{t.filters.title}</div>
                {activeCount > 0 && (
                  <button
                    onClick={() => {
                      resetFilters();
                      setOpenFilters(false);
                    }}
                    className="text-[11px] font-medium text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    {t.filters.reset}
                  </button>
                )}
              </div>

              {/* Activities */}
              <div className="px-4 py-3">
                <div className="text-[10px] uppercase tracking-wider text-text-disabled font-semibold mb-2">
                  {t.filters.activities}
                </div>
                <div className="space-y-1 max-h-[240px] overflow-y-auto pr-1">
                  <button
                    onClick={() => setActivityIds([])}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border text-[12px] transition-colors",
                      activityIds.length === 0
                        ? "bg-brand-500/15 border-brand-500/35 text-brand-300"
                        : "border-border/80 bg-surface-700/50 text-text-secondary hover:bg-surface-600/70",
                    )}
                  >
                    <span>{t.filters.all}</span>
                    {activityIds.length === 0 && <Check className="w-3.5 h-3.5" />}
                  </button>

                  {activities?.map((a) => {
                    const selected = activityIds.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        onClick={() => {
                          const next = selected
                            ? activityIds.filter((x) => x !== a.id)
                            : [...activityIds, a.id];
                          setActivityIds(next);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border text-[12px] transition-colors",
                          selected
                            ? "bg-brand-500/15 border-brand-500/35 text-text-primary"
                            : "border-border/80 bg-surface-700/50 text-text-secondary hover:bg-surface-600/70",
                        )}
                        title={a.name}
                      >
                        <span className="truncate">{a.name}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-brand-300" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Diagnosis */}
              <div className="px-4 py-3 border-t border-border">
                <div className="text-[10px] uppercase tracking-wider text-text-disabled font-semibold mb-2">
                  {t.filters.diagnosis}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["all", "passed", "failed"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setDiagnosisFilter(f)}
                      className={cn(
                        "h-9 rounded-lg border text-[12px] font-medium transition-colors",
                        diagnosisFilter === f
                          ? "bg-brand-500/15 border-brand-500/35 text-text-primary"
                          : "border-border/80 bg-surface-700/50 text-text-secondary hover:bg-surface-600/70",
                      )}
                    >
                      {f === "all"
                        ? t.filters.all
                        : f === "passed"
                        ? t.filters.passed
                        : t.filters.failed}
                    </button>
                  ))}
                </div>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Reset */}
        {activeCount > 0 && (
          <>
            <div className="w-px h-4 bg-border shrink-0" />
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors shrink-0 font-medium"
            >
              <X className="w-3 h-3" />
              {t.filters.reset}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
