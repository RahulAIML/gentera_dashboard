"use client";
import { useState } from "react";
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
  ChevronDown,
  ChevronRight,
  Users,
  Settings,
  HelpCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";

type NavItem = { 
  label: string; 
  href: string; 
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
};

type NavGroup = { 
  label: string; 
  items: NavItem[];
  icon?: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
};

export function ExecutiveSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { toggleLocale, locale, t } = useI18n();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['analytics', 'performance']));

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const navigation: NavGroup[] = [
    {
      label: t.nav.sections.analytics,
      icon: BarChart3,
      defaultOpen: true,
      items: [
        { 
          label: t.nav.dashboard, 
          href: "/dashboard", 
          icon: BarChart3,
          description: "Executive overview and KPIs"
        },
        { 
          label: t.nav.trends, 
          href: "/dashboard/trends", 
          icon: TrendingUp,
          description: "Performance trends and analysis"
        },
      ],
    },
    {
      label: t.nav.sections.performance,
      icon: Sparkles,
      defaultOpen: true,
      items: [
        { 
          label: t.nav.simulations, 
          href: "/dashboard/simulation", 
          icon: Sparkles,
          description: "Role-play simulation data"
        },
        { 
          label: t.nav.conversational, 
          href: "/dashboard/conversational", 
          icon: MessageSquare,
          description: "Conversation analytics"
        },
        { 
          label: t.nav.coaching, 
          href: "/dashboard/coaching", 
          icon: Brain,
          description: "AI-powered coaching insights"
        },
      ],
    },
    {
      label: t.nav.sections.organization,
      icon: Building2,
      defaultOpen: false,
      items: [
        { 
          label: t.nav.leaderboard, 
          href: "/dashboard/leaderboard", 
          icon: Trophy,
          description: "Top performers ranking"
        },
        { 
          label: t.nav.org, 
          href: "/dashboard/organizational", 
          icon: Building2,
          description: "Organizational structure"
        },
        { 
          label: t.nav.activities, 
          href: "/dashboard/activities", 
          icon: BookOpen,
          description: "Activity breakdown"
        },
      ],
    },
  ];

  return (
    <aside className="h-full w-72 bg-surface-900/95 backdrop-blur-xl border-r border-surface-800/50 flex flex-col">
      {/* Logo Section */}
      <div className="px-6 pt-6 pb-4 border-b border-surface-800/50">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-all duration-300">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-surface-50 leading-tight truncate group-hover:text-brand-400 transition-colors">
              Gentera
            </div>
            <div className="text-xs text-surface-400 leading-tight truncate">
              {locale === "es" ? "Inteligencia Ejecutiva" : "Executive Intelligence"}
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {navigation.map((group) => {
          const isExpanded = expandedGroups.has(group.label);
          const GroupIcon = group.icon;
          
          return (
            <div key={group.label} className="space-y-1">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-surface-500 uppercase tracking-wider hover:text-surface-300 hover:bg-surface-800/50 transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  {GroupIcon && <GroupIcon className="w-4 h-4" />}
                  {group.label}
                </div>
                <ChevronDown 
                  className={cn(
                    "w-3 h-3 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )} 
                />
              </button>

              {/* Group Items */}
              {isExpanded && (
                <div className="ml-2 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                          active
                            ? "bg-brand-500/10 text-brand-300 border border-brand-500/25 shadow-sm"
                            : "text-surface-400 hover:text-surface-200 hover:bg-surface-800/60 border border-transparent"
                        )}
                      >
                        <Icon className={cn(
                          "w-4 h-4 transition-colors duration-200",
                          active ? "text-brand-300" : "text-surface-500 group-hover:text-surface-400"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium leading-tight truncate">
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="text-xs text-surface-500 leading-relaxed truncate mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </div>
                        {item.badge && (
                          <div className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold">
                            {item.badge}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-surface-800/50 p-3 space-y-2">
        {/* Language Toggle */}
        <button
          onClick={toggleLocale}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-400 hover:text-surface-200 hover:bg-surface-800/60 transition-all duration-200 border border-transparent"
        >
          <Languages className="w-4 h-4" />
          <span className="flex-1 text-left text-sm">
            {locale === "es" ? "Español" : "English"}
          </span>
          <span className="text-xs font-semibold text-surface-500 bg-surface-800/60 px-2 py-1 rounded-lg">
            {locale === "es" ? "ES" : "EN"}
          </span>
        </button>

        {/* Help & Support */}
        <Link
          href="/help"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-400 hover:text-surface-200 hover:bg-surface-800/60 transition-all duration-200 border border-transparent"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="text-sm">Help & Support</span>
        </Link>

        {/* Settings */}
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-400 hover:text-surface-200 hover:bg-surface-800/60 transition-all duration-200 border border-transparent"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </Link>
      </div>

      {/* Version Info */}
      <div className="px-3 pb-4">
        <div className="text-center">
          <div className="text-xs text-surface-600 font-medium">
            v2.0 Executive
          </div>
          <div className="text-xs text-surface-700 mt-1">
            Premium Analytics Platform
          </div>
        </div>
      </div>
    </aside>
  );
}
