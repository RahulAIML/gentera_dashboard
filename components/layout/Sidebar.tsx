"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  MessageSquare,
  Brain,
  Trophy,
  Building2,
  BookOpen,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
type NavGroup = { label: string; items: NavItem[] };

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { toggleLocale, locale, t } = useI18n();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const groups: NavGroup[] = [
    {
      label: t.nav.sections.analytics,
      items: [
        { label: t.nav.dashboard, href: "/dashboard", icon: BarChart3 },
        { label: t.nav.trends, href: "/dashboard/trends", icon: TrendingUp },
      ],
    },
    {
      label: t.nav.sections.performance,
      items: [
        { label: t.nav.simulations, href: "/dashboard/simulation", icon: Sparkles },
        { label: t.nav.conversational, href: "/dashboard/conversational", icon: MessageSquare },
        { label: t.nav.coaching, href: "/dashboard/coaching", icon: Brain },
      ],
    },
    {
      label: t.nav.sections.organization,
      items: [
        { label: t.nav.leaderboard, href: "/dashboard/leaderboard", icon: Trophy },
        { label: t.nav.org, href: "/dashboard/organizational", icon: Building2 },
        { label: t.nav.activities, href: "/dashboard/activities", icon: BookOpen },
      ],
    },
  ];

  return (
    <aside className="h-full w-64 bg-surface-900 border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-text-primary leading-tight truncate">Gentera</div>
            <div className="text-[11px] text-text-muted leading-tight truncate">
              {locale === "es" ? "Analítica Ejecutiva" : "Executive Analytics"}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-2.5 mb-1.5 text-[10px] uppercase tracking-[0.18em] text-text-disabled font-semibold">
              {g.label}
            </div>
            <div className="space-y-1">
              {g.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-[13px] font-medium",
                      active
                        ? "bg-brand-500/10 text-text-primary border border-brand-500/25"
                        : "text-text-muted hover:text-text-primary hover:bg-surface-800/60 border border-transparent",
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", active ? "text-brand-300" : "text-text-muted")} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border p-2">
        <button
          onClick={toggleLocale}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-800/60 transition-colors text-[13px] border border-transparent hover:border-border"
        >
          <Languages className="w-4 h-4" />
          <span className="flex-1 text-left">{locale === "es" ? "Español" : "English"}</span>
          <span className="text-[11px] font-semibold text-text-disabled">{locale === "es" ? "ES" : "EN"}</span>
        </button>
      </div>
    </aside>
  );
}
