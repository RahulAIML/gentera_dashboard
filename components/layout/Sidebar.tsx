"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Activity, MessageSquare, Brain,
  Trophy, TrendingUp, ChevronRight, Zap, Shield, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_GROUPS = [
  {
    label: "Principal",
    items: [
      { label: "Executive Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "Tendencias", href: "/dashboard/trends", icon: TrendingUp },
    ],
  },
  {
    label: "Inteligencia",
    items: [
      { label: "Simulaciones", href: "/dashboard/simulation", icon: Activity },
      { label: "Conversacional", href: "/dashboard/conversational", icon: MessageSquare },
      { label: "Coaching IA", href: "/dashboard/coaching", icon: Brain },
    ],
  },
  {
    label: "Organización",
    items: [
      { label: "Equipos y Líneas", href: "/dashboard/organizational", icon: Users },
      { label: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
      { label: "Actividades", href: "/dashboard/activities", icon: BarChart3 },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative h-screen flex flex-col bg-surface-800 border-r border-border overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="text-sm font-bold text-text-primary leading-tight whitespace-nowrap">
                Gentera
              </div>
              <div className="text-[10px] text-text-muted uppercase tracking-widest whitespace-nowrap">
                Intelligence
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-6">
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 mb-2"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    {group.label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <ul className="space-y-0.5 px-2">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-all duration-150 group relative",
                        active
                          ? "bg-brand-500/10 text-brand-400"
                          : "text-text-secondary hover:bg-surface-700 hover:text-text-primary"
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-500 rounded-full"
                        />
                      )}
                      <item.icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          active ? "text-brand-400" : "text-text-muted group-hover:text-text-primary"
                        )}
                      />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.12 }}
                            className="whitespace-nowrap overflow-hidden font-medium"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-border">
        <div className={cn(
          "flex items-center gap-2 px-2 py-2 rounded-lg",
          collapsed ? "justify-center" : ""
        )}>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shrink-0">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="text-xs font-medium text-text-primary whitespace-nowrap">Gentera Admin</div>
                <div className="text-[10px] text-text-muted whitespace-nowrap">Enterprise</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-surface-600 border border-border flex items-center justify-center z-10 hover:bg-surface-500 transition-colors"
      >
        <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-3 h-3 text-text-secondary" />
        </motion.div>
      </button>
    </motion.aside>
  );
}
