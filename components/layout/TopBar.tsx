"use client";
import { RefreshCw } from "lucide-react";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { format } from "date-fns";
import { es as esLocale } from "date-fns/locale";
import { useI18n } from "@/lib/i18n";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const qc = useQueryClient();
  const isFetching = useIsFetching();
  const [refreshing, setRefreshing] = useState(false);
  const { locale, toggleLocale } = useI18n();

  async function handleRefresh() {
    setRefreshing(true);
    await qc.invalidateQueries();
    setTimeout(() => setRefreshing(false), 1000);
  }

  const now = new Date();
  const dateStr = format(now, "d MMM yyyy", { locale: esLocale });

  return (
    <header className="flex items-center justify-between px-5 h-13 border-b border-border bg-surface-900/80 backdrop-blur-xl shrink-0 relative" style={{ minHeight: "52px" }}>
      {/* Loading bar */}
      {(isFetching > 0 || refreshing) && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 loading-bar" />
        </div>
      )}

      {/* Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-text-primary leading-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-[11px] text-text-muted mt-px truncate hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-800 border border-border">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full live-dot",
            isFetching > 0 ? "text-brand-400 bg-brand-400" : "text-emerald-400 bg-emerald-400"
          )} />
          <span className="text-[10px] font-medium text-text-muted">
            {isFetching > 0 ? "Cargando" : "En vivo"}
          </span>
        </div>

        {/* Date */}
        <div className="hidden lg:block text-[11px] text-text-disabled capitalize px-1">
          {dateStr}
        </div>

        {/* Language toggle */}
        <button
          onClick={toggleLocale}
          className="w-8 h-8 rounded-lg bg-surface-800 border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-border-strong transition-all text-[10px] font-bold uppercase tracking-wider"
          title="Switch language"
        >
          {locale === "es" ? "EN" : "ES"}
        </button>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="w-8 h-8 rounded-lg bg-surface-800 border border-border flex items-center justify-center text-text-muted hover:text-brand-400 hover:border-brand-500/40 transition-all"
          title="Actualizar datos"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold cursor-pointer">
          G
        </div>
      </div>
    </header>
  );
}
