"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Activity, MessageSquare, Brain,
  Trophy, TrendingUp, BarChart3, ChevronRight, Zap, BookOpen,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV = [
  {
    group: "Vista General",
    items: [
      { label: "Executive Overview", href: "/dashboard", icon: LayoutDashboard, exact: true, accent: "amber" },
      { label: "Tendencias", href: "/dashboard/trends", icon: TrendingUp, accent: "blue" },
    ],
  },
  {
    group: "Inteligencia",
    items: [
      { label: "Simulaciones", href: "/dashboard/simulation", icon: Activity, accent: "blue" },
      { label: "Conversacional", href: "/dashboard/conversational", icon: MessageSquare, accent: "violet" },
      { label: "Coaching IA", href: "/dashboard/coaching", icon: Brain, accent: "emerald" },
    ],
  },
  {
    group: "Organización",
    items: [
      { label: "Equipos & Líneas", href: "/dashboard/organizational", icon: Users, accent: "blue" },
      { label: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy, accent: "amber" },
      { label: "Actividades", href: "/dashboard/activities", icon: BookOpen, accent: "violet" },
    ],
  },
];

const ACCENT_ACTIVE: Record<string, string> = {
  amber:   "text-brand-400 bg-brand-500/10",
  blue:    "text-blue-400 bg-blue-500/10",
  violet:  "text-violet-400 bg-violet-500/10",
  emerald: "text-emerald-400 bg-emerald-500/10",
};
const ACCENT_DOT: Record<string, string> = {
  amber:   "bg-brand-400",
  blue:    "bg-blue-400",
  violet:  "bg-violet-400",
  emerald: "bg-emerald-400",
};

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href) && href !== "/dashboard";
  }
  function isExactActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || (pathname.startsWith(href) && href !== "/dashboard");
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 232 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="relative h-screen flex flex-col border-r border-border bg-surface-900 overflow-hidden shrink-0 z-30"
    >
      {/* Top ambient glow */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-surface-900 live-dot text-emerald-400" />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="logo-text"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden leading-none"
            >
              <div className="text-sm font-bold gradient-brand whitespace-nowrap">Gentera</div>
              <div className="text-[9px] text-text-muted uppercase tracking-[0.2em] whitespace-nowrap mt-0.5">
                Intelligence Platform
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {NAV.map((section) => (
          <div key={section.group} className="mb-5">
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  key={section.group}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="px-4 mb-1.5"
                >
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-text-disabled">
                    {section.group}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="px-2 space-y-0.5">
              {section.items.map((item) => {
                const active = isExactActive(item.href, item.exact);
                const accentClass = active ? ACCENT_ACTIVE[item.accent] : "";
                const dotClass = ACCENT_DOT[item.accent];

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "relative flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 group",
                      active
                        ? cn("border border-border-accent", accentClass)
                        : "text-text-muted hover:text-text-secondary hover:bg-surface-750/60 border border-transparent"
                    )}
                  >
                    {/* Active left bar */}
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className={cn("absolute left-0 top-2 bottom-2 w-0.5 rounded-full", dotClass)}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    <item.icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors duration-150",
                        active ? "" : "group-hover:text-text-primary"
                      )}
                    />

                    <AnimatePresence initial={false}>
                      {!collapsed && (
                        <motion.span
                          key="label"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.12 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Version badge */}
      <div className="px-3 pb-3 border-t border-border pt-3">
        <AnimatePresence initial={false}>
          {!collapsed ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-surface-800 border border-border"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500/30 to-blue-500/20 flex items-center justify-center shrink-0">
                <BarChart3 className="w-3.5 h-3.5 text-brand-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-text-primary truncate">Gentera Analytics</div>
                <div className="text-[10px] text-text-muted">v2.0 · Enterprise</div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <div className="w-8 h-8 rounded-xl bg-surface-800 border border-border flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-brand-400" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3.5 top-[72px] w-7 h-7 rounded-full bg-surface-700 border border-border-strong flex items-center justify-center hover:bg-surface-600 hover:border-brand-500/40 transition-all z-40 shadow-lg"
      >
        <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.22 }}>
          <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
        </motion.div>
      </button>
    </motion.aside>
  );
}
