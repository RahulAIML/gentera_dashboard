"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Building2, Shield, User } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { KPICard } from "@/components/analytics/KPICard";
import { useFilteredSimulations, useMembers, useHierarchy } from "@/hooks/useAnalyticsData";
import { computeKPISummary } from "@/lib/analytics/kpiEngine";
import { fmtNumber, fmtPercent, fmtDate, initials } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";

export default function OrganizationalPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { data: members = [] } = useMembers();
  const hierarchy = useHierarchy();
  const { t } = useI18n();

  const kpis = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  const activeMembers = members.filter((m) => m.status === "active");

  return (
    <div className="min-h-full bg-surface-950">
      <TopBar title={t.nav.org} subtitle={t.scope.organization} />

      <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard title={t.scope.participants} value={fmtNumber(members.length)} icon={Users} accent="brand" index={0} />
          <KPICard title={t.kpi.uniqueUsers} value={fmtNumber(activeMembers.length)} subtitle={fmtPercent(members.length ? activeMembers.length / members.length : 0)} icon={User} accent="emerald" index={1} />
          <KPICard title={t.scope.supervisors} value={fmtNumber(hierarchy?.totals.supervisors ?? 0)} icon={Shield} accent="violet" index={2} />
          <KPICard title={t.scope.admins} value={fmtNumber(hierarchy?.totals.admins ?? 0)} subtitle={`${kpis.uniqueUsers} ${t.kpi.uniqueUsers.toLowerCase()}`} icon={Building2} accent="blue" index={3} loading={isLoading} />
        </div>

        {/* Hierarchy tree */}
        {hierarchy && hierarchy.supervisors.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface-900/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-text-primary">{t.scope.hierarchy}</h3>
              <p className="text-xs text-text-muted mt-0.5">{t.scope.organization}</p>
            </div>
            <div className="p-5 space-y-4">
              {hierarchy.supervisors.map((sup) => (
                <div key={sup.supervisor.id} className="rounded-xl border border-border bg-surface-800/40 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
                    <Shield className="w-4 h-4 text-violet-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-text-primary">{sup.supervisor.name}</span>
                      <span className="text-[10px] text-text-muted ml-2">{t.scope.supervisor}</span>
                    </div>
                    <span className="text-[10px] text-text-disabled tabular-nums">{sup.participantIds.size} {t.scope.participants.toLowerCase()}</span>
                  </div>
                  {sup.admins.length > 0 && (
                    <div className="divide-y divide-border/40">
                      {sup.admins.map((adm) => (
                        <div key={adm.admin.id} className="flex items-center gap-3 px-4 py-2.5 pl-8">
                          <User className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                          <span className="text-xs text-text-secondary flex-1">{adm.admin.name}</span>
                          <span className="text-[10px] text-text-disabled tabular-nums">{adm.participants.length}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {hierarchy.unsupervisedAdmins.length > 0 && (
                <div className="rounded-xl border border-border bg-surface-800/40 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
                    <Building2 className="w-4 h-4 text-text-muted shrink-0" />
                    <span className="text-xs font-semibold text-text-primary">{t.scope.admins}</span>
                  </div>
                  <div className="divide-y divide-border/40">
                    {hierarchy.unsupervisedAdmins.map((adm) => (
                      <div key={adm.admin.id} className="flex items-center gap-3 px-4 py-2.5 pl-8">
                        <User className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span className="text-xs text-text-secondary flex-1">{adm.admin.name}</span>
                        <span className="text-[10px] text-text-disabled tabular-nums">{adm.participants.length}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Member directory */}
        <div className="rounded-2xl border border-border bg-surface-900/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">{t.scope.participants}</h3>
            <p className="text-xs text-text-muted mt-0.5">{fmtNumber(members.length)} {t.common.results}</p>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full analytics-table">
              <thead className="sticky top-0 bg-surface-800 z-10">
                <tr className="border-b border-border">
                  {[t.table.user, "Email", t.table.diagnosis, t.table.date].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-text-muted font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.slice(0, 100).map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-surface-800/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                          {initials(m.name)}
                        </div>
                        <span className="text-xs font-medium text-text-primary">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5"><span className="text-xs text-text-secondary">{m.email}</span></td>
                    <td className="px-4 py-2.5">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-semibold", m.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-surface-600 text-text-muted")}>
                        {m.status === "active" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5"><span className="text-xs text-text-muted whitespace-nowrap">{fmtDate(m.createdAt)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {members.length > 100 && (
            <div className="px-5 py-3 border-t border-border text-xs text-text-muted">
              {t.common.showing} 100 {t.common.of} {fmtNumber(members.length)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
