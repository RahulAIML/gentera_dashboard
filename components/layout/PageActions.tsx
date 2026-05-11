"use client";
import { useState } from "react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Languages } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";

export function PageActions() {
  const qc = useQueryClient();
  const isFetching = useIsFetching();
  const [refreshing, setRefreshing] = useState(false);
  const { locale, toggleLocale, t } = useI18n();

  async function handleRefresh() {
    setRefreshing(true);
    await qc.invalidateQueries();
    setTimeout(() => setRefreshing(false), 700);
  }

  const busy = isFetching > 0 || refreshing;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleLocale}
        className="h-9 px-3 rounded-xl bg-surface-800/70 border border-border text-text-muted hover:text-text-primary hover:bg-surface-800 transition-colors text-[12px] font-medium flex items-center gap-2"
        title="Switch language"
      >
        <Languages className="w-4 h-4" />
        <span className="tabular-nums">{locale === "es" ? "ES" : "EN"}</span>
      </button>

      <button
        onClick={handleRefresh}
        className={cn(
          "h-9 w-9 rounded-xl bg-surface-800/70 border border-border text-text-muted hover:text-brand-300 hover:bg-surface-800 transition-colors flex items-center justify-center",
          busy && "border-brand-500/30 text-brand-300",
        )}
        title={t.common.refresh}
        aria-label={t.common.refresh}
      >
        <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
      </button>
    </div>
  );
}

