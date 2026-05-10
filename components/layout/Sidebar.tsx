"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Activity, MessageSquare, Brain,
  Trophy, TrendingUp, ChevronRight, Zap, BookOpen, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n();

  const NAV = [
    {
      group: "Overview",
      items: [
        { label: t.nav.dashboard, href: "/dashboard", icon: LayoutDashboard, exact: true },
        { label: t.nav.trends,    href: "/dashboard/trends", icon: TrendingUp },
      ],
    },
    {
      group: "Intelligence",
      items: [
        { label: t.nav.simulations,    href: "/dashboard/simulation",    icon: Activity },
        { label: t.nav.conversational, href: "/dashboard/conversational", icon: MessageSquare },
        { label: t.nav.coaching,       href: "/dashboard/coaching",      icon: Brain },
      ],
    },
    {
      group: "Organization",
      items: [
        { label: t.nav.org,         href: "/dashboard/organizational", icon: Building2 },
        { label: t.nav.leaderboard, href: "/dashboard/leaderboard",    icon: Trophy },
        { label: t.nav.activities,  href: "/dashboard/activities",     icon: BookOpen },
      ],
    },
  ];

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || (pathname.startsWith(href) && href !== "/dashboard");
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 232 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="relative h-screen flex flex-col border-r border-border bg-surface-950 overflow-hidden shrink-0 z-30"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-14 shrink-0 border-b border-border/60">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0">
          <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="brand-text"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden min-w-0"
            >
              <div className="text-[13px] font-bold text-text-primary leading-tight whitespace-nowrap">
                Gentera
              </div>
              <div className="text-[9px] text-text-disabled uppercase tracking-[0.18em] whitespace-nowrap mt-px">
                Intelligence
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
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
                  <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-text-disabled">
                    {section.group}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="px-2 space-y-px">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "relative flex items-center gap-3 px-2.5 py-2 rounded-md text-[12.5px] font-medium transition-colors duration-150 group",
                      active
                        ? "bg-surface-800 text-text-primary"
                        : "text-text-muted hover:text-text-primary hover:bg-surface-900",
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-full bg-brand-500"
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      />
                    )}
                    <item.icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        active ? "text-brand-400" : "text-text-muted group-hover:text-text-secondary",
                      )}
                      strokeWidth={1.8}
                    />
                    <AnimatePresence initial={false}>
                      {!collapsed && (
                        <motion.span
                          key="label"
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -4 }}
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

      {/* Footer */}
      <div className="px-3 pt-3 pb-3 border-t border-border/60">
        <AnimatePresence initial={false}>
          {!collapsed ? (
            <motion.div
              key="footer-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-text-muted">Gentera · Live</span>
            </motion.div>
          ) : (
            <motion.div
              key="footer-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[64px] w-6 h-6 rounded-full bg-surface-800 border border-border flex items-center justify-center hover:bg-surface-700 hover:border-brand-500/40 transition-all z-40"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.22 }}>
          <ChevronRight className="w-3 h-3 text-text-muted" />
        </motion.div>
      </button>
    </motion.aside>
  );
}
