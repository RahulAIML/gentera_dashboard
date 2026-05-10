"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Settings, Sun, BarChart3, BookOpen, Brain, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";

const NAV_ITEMS = [
  { label: "Resumen", href: "/dashboard", icon: BarChart3 },
  { label: "LMS", href: "/dashboard/activities", icon: BookOpen },
  { label: "Coach Maestro", href: "/dashboard/coaching", icon: Brain },
  { label: "Simulador", href: "/dashboard/simulation", icon: Users },
  { label: "Coach Certificador", href: "/dashboard/conversational", icon: Zap },
  { label: "Second Brain", href: "/dashboard/leaderboard", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { toggleLocale, locale } = useI18n();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-surface-900 border-r border-border flex flex-col z-20">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-text-primary">Gentera</div>
            <div className="text-xs text-text-muted">Intelligence</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                active
                  ? "bg-red-500/15 text-red-400 border border-red-500/30"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-800/50"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border p-2 space-y-1">
        {/* Theme Toggle */}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-800/50 transition-all text-sm">
          <Sun className="w-4 h-4" />
          <span>Modo claro</span>
        </button>

        {/* Language Toggle */}
        <button
          onClick={toggleLocale}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-800/50 transition-all text-sm"
        >
          <span className="w-4 h-4 text-xs font-bold flex items-center justify-center">{locale === "es" ? "ES" : "EN"}</span>
          <span>{locale === "es" ? "Español" : "English"}</span>
        </button>

        {/* Settings */}
        <Link
          href="#"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-800/50 transition-all text-sm"
        >
          <Settings className="w-4 h-4" />
          <span>Ajustes</span>
        </Link>

        {/* Logout */}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all text-sm border border-transparent hover:border-red-500/30">
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
