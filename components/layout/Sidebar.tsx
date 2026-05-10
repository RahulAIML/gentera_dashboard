"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Activity, MessageSquare, Brain,
  Trophy, TrendingUp, BarChart3, ChevronRight, Zap, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV = [
  {
    group: "Vista General",
    items: [
      { label: "Resumen Ejecutivo", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "Tendencias",        href: "/dashboard/trends",        icon: TrendingUp },
    ],
  },
  {
    group: "Inteligencia",
    items: [
      { label: "Simulaciones",    href: "/dashboard/simulation",    icon: Activity },
      { label: "Conversacional",  href: "/dashboard/conversational", icon: MessageSquare },
      { label: "Coaching IA",     href: "/dashboard/coaching",      icon: Brain },
    ],
  },
  {
    group: "Organización",
    items: [
      { label: "Equipos",      href: "/dashboard/organizational", icon: Users },
      { label: "Leaderboard",  href: "/dashboard/leaderboard",    icon: Trophy },
      { label: "Actividades",  href: "/dashboard/activities",     icon: BookOpen },
    ],
  },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || (pathname.startsWith(href) && href !== "/dashboard");
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 224 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="relative h-screen flex flex-col border-r border-border bg-surface-900 overflow-hidden shrink-0 z-30"
    >
      {/* Logo */}
      <div className="relative flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
        <div className="relative shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-surface-900 live-dot text-emerald-400" />
        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="logo-text"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden leading-none min-w-0"
            >
              <div className="text-sm font-bold gradient-brand whitespace-nowrap">Gentera</div>
              <div className="text-[9px] text-text-disabled uppercase tracking-[0.18em] whitespace-nowrap mt-0.5">
                Intelligence
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden scrollbar-none">
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
                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-text-disabled">
                    {section.group}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="px-2 space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 group",
                      active
                        ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                        : "text-text-muted hover:text-text-secondary hover:bg-surface-750/60 border border-transparent"
                    )}
                  >
                    {/* Active left indicator */}
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-brand-400"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}

                    <item.icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors duration-150",
                        active ? "text-brand-400" : "group-hover:text-text-primary"
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
                          className="whitespace-nowrap overflow-hidden text-[13px]"
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

      {/* Footer badge */}
      <div className="px-3 pb-3 border-t border-border pt-3">
        <AnimatePresence initial={false}>
          {!collapsed ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-surface-800 border border-border"
            >
              <div className="w-6 h-6 rounded-md bg-brand-500/15 flex items-center justify-center shrink-0">
                <BarChart3 className="w-3.5 h-3.5 text-brand-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-text-primary truncate">Analytics</div>
                <div className="text-[10px] text-text-disabled">v2.0 · Enterprise</div>
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
              <div className="w-8 h-8 rounded-lg bg-surface-800 border border-border flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-brand-400" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[66px] w-6 h-6 rounded-full bg-surface-700 border border-border-strong flex items-center justify-center hover:bg-surface-600 transition-all z-40 shadow-md"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.22 }}>
          <ChevronRight className="w-3 h-3 text-text-muted" />
        </motion.div>
      </button>
    </motion.aside>
  );
}
