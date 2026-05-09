"use client";
import { Bell, Search, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await qc.invalidateQueries();
    setTimeout(() => setRefreshing(false), 800);
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-surface-800/50 border-b border-border backdrop-blur-sm">
      <div>
        <h1 className="text-lg font-semibold text-text-primary leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-700 transition-all"
          title="Actualizar datos"
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
        </button>
        <div className="flex items-center gap-2 bg-surface-700 border border-border rounded-lg px-3 py-1.5 text-sm text-text-muted hover:border-surface-300 transition-colors">
          <Search className="w-3.5 h-3.5" />
          <span className="text-xs hidden sm:block">Buscar…</span>
        </div>
        <button className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-700 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
          G
        </div>
      </div>
    </header>
  );
}
