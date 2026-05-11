// ============================================================
// GENTERA HIERARCHY ENGINE
// Builds supervisor → admin → participant tree from real Gentera data.
// Source of truth:
//   - administrator.rpa_profile_type      ('supervisor' | 'admin' | …)
//   - administrator.rpa_parent            (supervisor link)
//   - members.mb_admin                    (participant link)
// All role-scoped analytics derive their visibility set from this tree.
// ============================================================

import type {
  NormalizedAdmin,
  NormalizedMember,
  NormalizedSimulation,
  AdminNode,
  SupervisorNode,
  GenteraHierarchy,
} from "@/types/analytics";

export function buildHierarchy(
  admins: NormalizedAdmin[],
  members: NormalizedMember[],
): GenteraHierarchy {
  const adminsById = new Map<number, NormalizedAdmin>();
  for (const a of admins) adminsById.set(a.id, a);

  // Group participants by admin id
  const participantsByAdmin = new Map<number, NormalizedMember[]>();
  const orphanParticipants: NormalizedMember[] = [];
  for (const m of members) {
    if (!adminsById.has(m.adminId)) {
      orphanParticipants.push(m);
      continue;
    }
    const list = participantsByAdmin.get(m.adminId);
    if (list) list.push(m);
    else participantsByAdmin.set(m.adminId, [m]);
  }

  // Build admin nodes (only for actual 'admin' or 'supervisor' profile types
  // that have either participants or admins under them — others are infra)
  const adminNodes = new Map<number, AdminNode>();
  for (const a of admins) {
    if (a.profileType !== "admin") continue;
    const participants = participantsByAdmin.get(a.id) ?? [];
    adminNodes.set(a.id, {
      admin: a,
      participants,
      participantIds: new Set(participants.map((p) => p.id)),
      participantUserIds: new Set(
        participants.map((p) => (p.userId ?? "").toLowerCase()).filter(Boolean),
      ),
    });
  }

  // Build supervisor nodes (admins whose rpa_parent is a supervisor go under it)
  const supervisorNodes = new Map<number, SupervisorNode>();
  for (const a of admins) {
    if (a.profileType !== "supervisor") continue;
    supervisorNodes.set(a.id, {
      supervisor: a,
      admins: [],
      participantIds: new Set<number>(),
      participantUserIds: new Set<string>(),
    });
  }

  // Wire admins into supervisors via rpa_parent
  const unsupervised: AdminNode[] = [];
  for (const node of adminNodes.values()) {
    const parent = supervisorNodes.get(node.admin.parentId);
    if (parent) {
      parent.admins.push(node);
      for (const id of node.participantIds) parent.participantIds.add(id);
      for (const u of node.participantUserIds) parent.participantUserIds.add(u);
    } else {
      unsupervised.push(node);
    }
  }

  // Sort for stable rendering
  const collator = new Intl.Collator(undefined, { sensitivity: "base" });
  const supervisors = Array.from(supervisorNodes.values()).sort((a, b) =>
    collator.compare(a.supervisor.name, b.supervisor.name),
  );
  for (const s of supervisors) {
    s.admins.sort((a, b) => collator.compare(a.admin.name, b.admin.name));
  }
  unsupervised.sort((a, b) => collator.compare(a.admin.name, b.admin.name));

  return {
    supervisors,
    unsupervisedAdmins: unsupervised,
    byAdminId: adminNodes,
    bySupervisorId: supervisorNodes,
    orphanParticipants,
    totals: {
      supervisors: supervisors.length,
      admins: adminNodes.size,
      participants: Array.from(adminNodes.values()).reduce(
        (sum, n) => sum + n.participants.length,
        0,
      ),
      orphanParticipants: orphanParticipants.length,
    },
  };
}

// ── Visibility scopes ────────────────────────────────────────
// A "scope" is the set of participants visible to the active role view.
// Simulations / members / KPIs are filtered through this set.

export type RoleScope =
  | { kind: "executive" }                           // sees all Gentera participants
  | { kind: "supervisor"; supervisorId: number }    // sees admins + their participants
  | { kind: "admin"; adminId: number }              // sees own participants
  | { kind: "participant"; userId: string };        // sees own simulations

type Locale = "es" | "en";

export interface ResolvedScope {
  participantIds: Set<number>;
  participantUserIds: Set<string>;          // lowercased mb_user
  label: string;
  description: string;
}

export function resolveScope(
  scope: RoleScope,
  hierarchy: GenteraHierarchy,
): ResolvedScope {
  return resolveScopeLocalized(scope, hierarchy, "es");
}

export function resolveScopeLocalized(
  scope: RoleScope,
  hierarchy: GenteraHierarchy,
  locale: Locale,
): ResolvedScope {
  if (scope.kind === "executive") {
    const ids = new Set<number>();
    const users = new Set<string>();
    for (const node of hierarchy.byAdminId.values()) {
      for (const id of node.participantIds) ids.add(id);
      for (const u of node.participantUserIds) users.add(u);
    }
    for (const m of hierarchy.orphanParticipants) {
      ids.add(m.id);
      users.add((m.userId ?? "").toLowerCase());
    }
    return {
      participantIds: ids,
      participantUserIds: users,
      label: locale === "en" ? "Executive View" : "Vista Ejecutiva",
      description:
        locale === "en"
          ? `Entire Gentera organization · ${ids.size} participants`
          : `Toda la organización Gentera · ${ids.size} participantes`,
    };
  }

  if (scope.kind === "supervisor") {
    const node = hierarchy.bySupervisorId.get(scope.supervisorId);
    if (!node) return emptyScope(locale, locale === "en" ? "Supervisor not found" : "Supervisor no encontrado");
    return {
      participantIds: new Set(node.participantIds),
      participantUserIds: new Set(node.participantUserIds),
      label: `Supervisor · ${node.supervisor.name}`,
      description:
        locale === "en"
          ? `${node.admins.length} admins · ${node.participantIds.size} participants`
          : `${node.admins.length} admins · ${node.participantIds.size} participantes`,
    };
  }

  if (scope.kind === "admin") {
    const node = hierarchy.byAdminId.get(scope.adminId);
    if (!node) return emptyScope(locale, locale === "en" ? "Admin not found" : "Admin no encontrado");
    return {
      participantIds: new Set(node.participantIds),
      participantUserIds: new Set(node.participantUserIds),
      label: `Admin · ${node.admin.name}`,
      description:
        locale === "en"
          ? `${node.participants.length} assigned participants`
          : `${node.participants.length} participantes asignados`,
    };
  }

  // participant
  const u = scope.userId.toLowerCase();
  return {
    participantIds: new Set(),
    participantUserIds: new Set([u]),
    label: `${locale === "en" ? "Participant" : "Participante"} · ${scope.userId}`,
    description: locale === "en" ? "Personal view" : "Vista personal",
  };
}

function emptyScope(locale: Locale, label: string): ResolvedScope {
  return {
    participantIds: new Set(),
    participantUserIds: new Set(),
    label,
    description: locale === "en" ? "No access" : "Sin acceso",
  };
}

// ── Simulation filtering by scope ────────────────────────────
// Simulations carry a userId (mb_user). We match it against the scope's
// participantUserIds set. Case-insensitive.
export function filterSimulationsByScope(
  sims: NormalizedSimulation[],
  scope: ResolvedScope,
): NormalizedSimulation[] {
  if (scope.participantUserIds.size === 0) return [];
  const set = scope.participantUserIds;
  return sims.filter((s) => {
    const u = (s.userId ?? "").toLowerCase();
    return u && set.has(u);
  });
}

export function filterMembersByScope(
  members: NormalizedMember[],
  scope: ResolvedScope,
): NormalizedMember[] {
  if (scope.participantIds.size === 0) return [];
  return members.filter((m) => scope.participantIds.has(m.id));
}
