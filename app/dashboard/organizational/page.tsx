"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, MapPin, Building, User } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { KPICard } from "@/components/analytics/KPICard";
import { useFilteredSimulations, useMembers } from "@/hooks/useAnalyticsData";
import {
  computeKPISummary,
  computeUserKPIs,
} from "@/lib/analytics/kpiEngine";
import { fmtNumber, fmtPercent, fmtDate, initials } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

export default function OrganizationalPage() {
  const { simulations, isLoading } = useFilteredSimulations();
  const { data: members = [] } = useMembers();

  const kpis = useMemo(() => computeKPISummary(simulations, []), [simulations]);
  const userKPIs = useMemo(() => computeUserKPIs(simulations), [simulations]);

  // Member status breakdown
  const activeMembers = members.filter((m) => m.status === "active");
  const inactiveMembers = members.filter((m) => m.status === "inactive");

  // Simulating members who have participated
  const participatingUsers = new Set(simulations.map((s) => s.userName));
  const memberParticipation = members.filter((m) =>
    participatingUsers.has(m.name) || participatingUsers.has(m.email)
  );

  // Group by line (if available)
  const lineMap = new Map<string, { count: number; members: typeof members }>();
  for (const m of members) {
    const line = m.line || "Sin línea";
    if (!lineMap.has(line)) lineMap.set(line, { count: 0, members: [] });
    lineMap.get(line)!.count++;
    lineMap.get(line)!.members.push(m);
  }
  const lineData = Array.from(lineMap.entries())
    .filter(([k]) => k !== "Sin línea" || lineMap.size === 1)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .map(([name, val], i) => ({ name, count: val.count, color: COLORS[i % COLORS.length] }));

  // Group by state/city
  const stateMap = new Map<string, number>();
  for (const m of members) {
    const state = m.state || "Sin estado";
    stateMap.set(state, (stateMap.get(state) ?? 0) + 1);
  }
  const stateData = Array.from(stateMap.entries())
    .filter(([k]) => k !== "Sin estado" || stateMap.size === 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, count], i) => ({ name, count, color: COLORS[i % COLORS.length] }));

  function LineTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-surface-700 border border-border rounded-lg p-2 text-xs">
        <p className="font-semibold text-text-primary">{payload[0]?.payload?.name}</p>
        <p className="text-text-secondary">{payload[0]?.value} miembros</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-surface-900">
      <TopBar title="Inteligencia Organizacional" subtitle="Estructura, equipos y participación" />

      <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Total Miembros" value={fmtNumber(members.length)} icon={Users} accent="blue" index={0} />
          <KPICard title="Miembros Activos" value={fmtNumber(activeMembers.length)} subtitle={fmtPercent(members.length ? activeMembers.length / members.length : 0)} icon={User} accent="emerald" index={1} />
          <KPICard title="Asesores con Sims." value={fmtNumber(kpis.uniqueUsers)} subtitle={`de ${members.length} totales`} icon={Building} accent="violet" index={2} loading={isLoading} />
          <KPICard title="Líneas / Grupos" value={fmtNumber(lineMap.size)} icon={MapPin} accent="cyan" index={3} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* By line */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-1">Distribución por Línea</h3>
            <p className="text-xs text-text-muted mb-5">Miembros por línea organizacional</p>
            {lineData.length === 0 || (lineData.length === 1 && lineData[0].name === "Sin línea") ? (
              <div className="h-48 flex items-center justify-center text-text-muted text-sm">
                No hay datos de línea disponibles en los registros de miembros
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={lineData} layout="vertical" margin={{ top: 0, right: 20, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip content={<LineTooltip />} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={24}>
                    {lineData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* By state */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-1">Distribución por Estado/Región</h3>
            <p className="text-xs text-text-muted mb-5">Miembros por ubicación geográfica</p>
            {stateData.length === 0 || (stateData.length === 1 && stateData[0].name === "Sin estado") ? (
              <div className="h-48 flex items-center justify-center text-text-muted text-sm">
                No hay datos geográficos disponibles en los registros de miembros
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stateData} layout="vertical" margin={{ top: 0, right: 20, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<LineTooltip />} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={24}>
                    {stateData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Member directory */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">Directorio de Miembros</h3>
            <p className="text-xs text-text-muted mt-0.5">{fmtNumber(members.length)} miembros registrados</p>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full analytics-table">
              <thead className="sticky top-0 bg-surface-800 z-10">
                <tr className="border-b border-border">
                  {["Nombre", "Email", "Estado", "Línea", "Rama", "Ingreso"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-text-muted font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.slice(0, 100).map((m, i) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-surface-700/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                          {initials(m.name)}
                        </div>
                        <span className="text-xs font-medium text-text-primary">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-text-secondary">{m.email}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                        m.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-surface-600 text-text-muted"
                      )}>
                        {m.status === "active" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-text-muted">{m.line || "—"}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-text-muted">{m.branch || "—"}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-text-muted whitespace-nowrap">{fmtDate(m.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {members.length > 100 && (
            <div className="px-5 py-3 border-t border-border text-xs text-text-muted">
              Mostrando 100 de {fmtNumber(members.length)} miembros
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
