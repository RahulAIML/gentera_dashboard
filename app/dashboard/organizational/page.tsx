"use client";
import { useMemo } from "react";
import { Users, Building2, Shield, User, ChevronDown } from "lucide-react";
import { PageShell, PageSection } from "@/components/layout/PageShell";
import { PageActions } from "@/components/layout/PageActions";
import { FilterBar } from "@/components/layout/FilterBar";
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
  const { t, locale } = useI18n();

  const kpis = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  const activeMembers = members.filter((m) => m.status === "active");

  return (
    <PageShell
      title={t.nav.org}
      subtitle={t.scope.organization}
      actions={<PageActions />}
      filters={<FilterBar />}
    >
      <PageSection variant="bare">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard title={t.scope.participants} value={fmtNumber(members.length, locale)} icon={Users} accent="brand" index={0} />
          <KPICard title={t.kpi.uniqueUsers} value={fmtNumber(activeMembers.length, locale)} subtitle={fmtPercent(members.length ? activeMembers.length / members.length : 0)} icon={User} accent="emerald" index={1} />
          <KPICard title={t.scope.supervisors} value={fmtNumber(hierarchy?.totals.supervisors ?? 0, locale)} icon={Shield} accent="violet" index={2} />
          <KPICard title={t.scope.admins} value={fmtNumber(hierarchy?.totals.admins ?? 0, locale)} subtitle={`${kpis.uniqueUsers} ${t.kpi.uniqueUsers.toLowerCase()}`} icon={Building2} accent="blue" index={3} loading={isLoading} />
        </div>
      </PageSection>

      {/* Hierarchy tree */}
      {hierarchy && hierarchy.supervisors.length > 0 && (
        <PageSection title={t.scope.hierarchy} description={t.scope.organization}>
          <div className="space-y-4">
            {hierarchy.supervisors.map((sup) => (
              <details
                key={sup.supervisor.id}
                className="group rounded-xl border border-border bg-surface-800/40 overflow-hidden"
              >
                <summary className="list-none flex items-center gap-3 px-4 py-3 cursor-pointer select-none">
                  <Shield className="w-4 h-4 text-violet-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-text-primary truncate">{sup.supervisor.name}</div>
                    <div className="text-[10px] text-text-muted">
                      {sup.admins.length} {t.scope.admins.toLowerCase()} · {sup.participantIds.size} {t.scope.participants.toLowerCase()}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-muted transition-transform group-open:rotate-180" />
                </summary>

                {sup.admins.length > 0 && (
                  <div className="border-t border-border/60 divide-y divide-border/40">
                    {sup.admins.map((adm) => (
                      <div key={adm.admin.id} className="flex items-center gap-3 px-4 py-2.5 pl-8">
                        <User className="w-3.5 h-3.5 text-brand-300 shrink-0" />
                        <span className="text-xs text-text-secondary flex-1 truncate">{adm.admin.name}</span>
                        <span className="text-[10px] text-text-disabled tabular-nums">{adm.participants.length}</span>
                      </div>
                    ))}
                  </div>
                )}
              </details>
            ))}

            {hierarchy.unsupervisedAdmins.length > 0 && (
              <details className="group rounded-xl border border-border bg-surface-800/40 overflow-hidden">
                <summary className="list-none flex items-center gap-3 px-4 py-3 cursor-pointer select-none">
                  <Building2 className="w-4 h-4 text-text-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-text-primary truncate">{t.scope.admins}</div>
                    <div className="text-[10px] text-text-muted">
                      {hierarchy.unsupervisedAdmins.length} {t.scope.admins.toLowerCase()}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-muted transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-border/60 divide-y divide-border/40">
                  {hierarchy.unsupervisedAdmins.map((adm) => (
                    <div key={adm.admin.id} className="flex items-center gap-3 px-4 py-2.5 pl-8">
                      <User className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span className="text-xs text-text-secondary flex-1 truncate">{adm.admin.name}</span>
                      <span className="text-[10px] text-text-disabled tabular-nums">{adm.participants.length}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </PageSection>
      )}

      {/* Member directory */}
      <PageSection title={t.scope.participants} description={`${fmtNumber(members.length, locale)} ${t.common.results}`}>
        <div className="overflow-x-auto max-h-[440px] overflow-y-auto rounded-xl border border-border bg-surface-900/30">
          <table className="w-full analytics-table">
            <thead className="sticky top-0 bg-surface-800 z-10">
              <tr className="border-b border-border">
                {[t.table.user, t.auth.email, t.table.diagnosis, t.table.date].map((h) => (
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
                      {m.status === "active" ? t.common.active : t.common.inactive}
                    </span>
                  </td>
                  <td className="px-4 py-2.5"><span className="text-xs text-text-muted whitespace-nowrap">{fmtDate(m.createdAt, locale)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {members.length > 100 && (
          <div className="pt-4 text-[12px] text-text-muted">
            {t.common.showing} 100 {t.common.of} {fmtNumber(members.length, locale)}
          </div>
        )}
      </PageSection>
    </PageShell>
  );
}
