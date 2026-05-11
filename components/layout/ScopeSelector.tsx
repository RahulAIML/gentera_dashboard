"use client";
// ============================================================
// SCOPE SELECTOR
// Drives role-aware visibility. Sits in the FilterBar.
// Lets executives drill into a specific supervisor or admin view —
// every page reflows automatically because hooks consume `useResolvedScope`.
// ============================================================
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, ChevronDown, Crown, Shield, User, Search } from "lucide-react";
import { useScopeStore } from "@/lib/store/scopeStore";
import { useHierarchy, useResolvedScope } from "@/hooks/useAnalyticsData";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";
import type { RoleScope } from "@/lib/analytics/hierarchy";

export function ScopeSelector() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const hierarchy = useHierarchy();
  const resolved = useResolvedScope();
  const scope = useScopeStore((s) => s.scope);
  const setScope = useScopeStore((s) => s.setScope);

  const filteredSupervisors = useMemo(() => {
    if (!hierarchy) return [];
    const q = query.toLowerCase().trim();
    if (!q) return hierarchy.supervisors;
    return hierarchy.supervisors
      .map((s) => ({
        ...s,
        admins: s.admins.filter(
          (a) =>
            a.admin.name.toLowerCase().includes(q) ||
            s.supervisor.name.toLowerCase().includes(q),
        ),
      }))
      .filter((s) => s.supervisor.name.toLowerCase().includes(q) || s.admins.length > 0);
  }, [hierarchy, query]);

  const filteredOrphans = useMemo(() => {
    if (!hierarchy) return [];
    const q = query.toLowerCase().trim();
    if (!q) return hierarchy.unsupervisedAdmins;
    return hierarchy.unsupervisedAdmins.filter((a) =>
      a.admin.name.toLowerCase().includes(q),
    );
  }, [hierarchy, query]);

  if (!hierarchy || !resolved) {
    return (
      <div className="h-8 px-3 rounded-lg bg-surface-700/60 border border-border/80 flex items-center gap-2 text-[11px] text-text-disabled">
        <Building2 className="w-3.5 h-3.5" />
        {t.common.loading}
      </div>
    );
  }

  function pick(next: RoleScope) {
    setScope(next);
    setOpen(false);
    setQuery("");
  }

  const icon =
    scope.kind === "executive" ? Crown : scope.kind === "supervisor" ? Shield : User;
  const Icon = icon;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "h-8 px-3 rounded-lg flex items-center gap-2 transition-colors",
          "bg-surface-700/80 border border-border/80 hover:border-brand-500/50",
          open && "border-brand-500/60 bg-surface-600",
        )}
      >
        <Icon className="w-3.5 h-3.5 text-brand-400" />
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[11px] font-semibold text-text-primary">
            {resolved.label}
          </span>
          <span className="text-[9px] text-text-disabled">
            {resolved.description}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-3 h-3 text-text-muted transition-transform ml-1",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-30"
            />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-10 left-0 z-40 w-[360px] rounded-xl bg-surface-750 border border-border shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-3 py-2.5 border-b border-border">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-text-disabled mb-1.5">
                  {t.scope.title}
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-disabled" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.common.search}
                    className="w-full h-7 pl-7 pr-2 text-[11px] rounded-md bg-surface-700 border border-border/80 focus:border-brand-500/60 outline-none text-text-primary placeholder:text-text-disabled"
                  />
                </div>
              </div>

              {/* Body */}
              <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
                {/* Executive */}
                <button
                  onClick={() => pick({ kind: "executive" })}
                  className={cn(
                    "w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors",
                    scope.kind === "executive"
                      ? "bg-brand-500/15 border border-brand-500/40"
                      : "hover:bg-surface-700/50 border border-transparent",
                  )}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-text-primary">
                      {t.scope.executive}
                    </div>
                    <div className="text-[10px] text-text-muted">
                      {hierarchy.totals.participants} {t.scope.participants} ·{" "}
                      {hierarchy.totals.supervisors} {t.scope.supervisors} ·{" "}
                      {hierarchy.totals.admins} {t.scope.admins}
                    </div>
                  </div>
                </button>

                {/* Supervisors w/ admins */}
                {filteredSupervisors.length > 0 && (
                  <div className="pt-2">
                    <div className="px-2.5 pb-1 text-[9px] font-semibold uppercase tracking-wider text-text-disabled">
                      {t.scope.supervisors}
                    </div>
                    {filteredSupervisors.map((s) => (
                      <div key={s.supervisor.id} className="space-y-0.5">
                        <button
                          onClick={() =>
                            pick({ kind: "supervisor", supervisorId: s.supervisor.id })
                          }
                          className={cn(
                            "w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors",
                            scope.kind === "supervisor" &&
                              scope.supervisorId === s.supervisor.id
                              ? "bg-brand-500/15 border border-brand-500/40"
                              : "hover:bg-surface-700/50 border border-transparent",
                          )}
                        >
                          <Shield className="w-3 h-3 text-violet-400 shrink-0" />
                          <span className="flex-1 text-[11px] font-medium text-text-primary truncate">
                            {s.supervisor.name}
                          </span>
                          <span className="text-[9px] text-text-disabled tabular-nums">
                            {s.participantIds.size}
                          </span>
                        </button>
                        {s.admins.map((a) => (
                          <button
                            key={a.admin.id}
                            onClick={() =>
                              pick({ kind: "admin", adminId: a.admin.id })
                            }
                            className={cn(
                              "w-full text-left pl-7 pr-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors",
                              scope.kind === "admin" && scope.adminId === a.admin.id
                                ? "bg-brand-500/15 border border-brand-500/40"
                                : "hover:bg-surface-700/50 border border-transparent",
                            )}
                          >
                            <User className="w-3 h-3 text-text-muted shrink-0" />
                            <span className="flex-1 text-[11px] text-text-secondary truncate">
                              {a.admin.name}
                            </span>
                            <span className="text-[9px] text-text-disabled tabular-nums">
                              {a.participants.length}
                            </span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Standalone admins */}
                {filteredOrphans.length > 0 && (
                  <div className="pt-2">
                    <div className="px-2.5 pb-1 text-[9px] font-semibold uppercase tracking-wider text-text-disabled">
                      {t.scope.admins}
                    </div>
                    {filteredOrphans.map((a) => (
                      <button
                        key={a.admin.id}
                        onClick={() => pick({ kind: "admin", adminId: a.admin.id })}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors",
                          scope.kind === "admin" && scope.adminId === a.admin.id
                            ? "bg-brand-500/15 border border-brand-500/40"
                            : "hover:bg-surface-700/50 border border-transparent",
                        )}
                      >
                        <User className="w-3 h-3 text-text-muted shrink-0" />
                        <span className="flex-1 text-[11px] text-text-primary truncate">
                          {a.admin.name}
                        </span>
                        <span className="text-[9px] text-text-disabled tabular-nums">
                          {a.participants.length}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredSupervisors.length === 0 && filteredOrphans.length === 0 && (
                  <div className="px-3 py-6 text-center text-[11px] text-text-disabled">
                    {t.common.noData}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
