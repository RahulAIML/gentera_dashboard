import { parseISO, format, isValid, getWeek, getYear } from "date-fns";
import type {
  RawActivity,
  RawSimulation,
  RawMember,
  RawAdmin,
  RawPuntos,
  NormalizedActivity,
  NormalizedSimulation,
  NormalizedMember,
  NormalizedAdmin,
  InteractionRound,
} from "@/types/analytics";

function parsePuntos(val: RawPuntos): number | null {
  if (val === "No aplica") return null;
  return val;
}

function parseDate(raw: string): Date | null {
  const d = parseISO(raw);
  return isValid(d) ? d : null;
}

function weekKey(d: Date): string {
  const week = getWeek(d, { weekStartsOn: 1 });
  const year = getYear(d);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function normalizeActivities(raw: RawActivity[]): NormalizedActivity[] {
  return raw.map((a) => ({
    id: a.ID_Caso_de_Uso,
    name: a.Caso_de_Uso,
    slug: a.Actividad_Nombre,
  }));
}

export function normalizeSimulations(
  raw: RawSimulation[],
  activityMap: Map<number, NormalizedActivity>
): NormalizedSimulation[] {
  return raw
    .map((s): NormalizedSimulation | null => {
      const ts = parseDate(s.Fecha_y_Hora);
      if (!ts) return null;

      const activity = activityMap.get(s.ID_Caso_de_Uso);
      const rounds: InteractionRound[] = [1, 2, 3, 4, 5, 6].map((i) => {
        const idx = i as 1 | 2 | 3 | 4 | 5 | 6;
        const rawScore = s[`Puntos_${idx}`] as RawPuntos;
        const score = parsePuntos(rawScore);
        const fb = s[`Retroalimentacion_${idx}` as keyof RawSimulation] as string;
        return {
          index: i,
          prompt: s[`Pregunta_${idx}` as keyof RawSimulation] as string ?? "",
          response: s[`Respuesta_${idx}` as keyof RawSimulation] as string ?? "",
          score,
          feedback: fb && fb !== "No aplica" ? fb : null,
          applicable: score !== null,
        };
      });

      const applicableRounds = rounds.filter((r) => r.applicable);
      const maxApplicablePoints = applicableRounds.length;

      return {
        id: s.ID_Sim,
        activityId: s.ID_Caso_de_Uso,
        activityName: activity?.name ?? `Actividad ${s.ID_Caso_de_Uso}`,
        activitySlug: activity?.slug ?? "",
        timestamp: ts,
        userName: s.Usuario_Nombre,
        userId: s.Usuario,
        score: s.Calificacion,
        passed: s.Diagnostico_Final === "Si",
        totalPoints: s.Puntos_Totales,
        maxApplicablePoints,
        rounds,
        monthKey: format(ts, "yyyy-MM"),
        weekKey: weekKey(ts),
        dateKey: format(ts, "yyyy-MM-dd"),
      };
    })
    .filter((s): s is NormalizedSimulation => s !== null);
}

export function normalizeMembers(raw: RawMember[]): NormalizedMember[] {
  return raw.map((m) => {
    const created = parseDate(m.mb_date_create);
    const lastLogin = m.mb_last_login && m.mb_last_login !== "0000-00-00 00:00:00"
      ? parseDate(m.mb_last_login)
      : null;
    return {
      id: m.mb_id,
      name: m.mb_fullname,
      email: m.mb_email,
      userId: m.mb_user,
      status: m.mb_status === 1 ? "active" : "inactive",
      line: m.mb_line || "Sin línea",
      branch: m.mb_branch || "Sin rama",
      city: m.mb_city || "Sin ciudad",
      state: m.mb_state || "Sin estado",
      designation: m.mb_designation || "Sin cargo",
      employeeCode: m.mb_employee_code || "",
      lastLogin,
      createdAt: created ?? new Date(),
    };
  });
}

export function normalizeAdmins(raw: RawAdmin[]): NormalizedAdmin[] {
  return raw.map((a) => ({
    id: a.rpa_id,
    name: a.rpa_full_name,
    email: a.rpa_email,
    profileType: a.rpa_profile_type,
    parentId: a.rpa_parent,
    sede: a.rpa_sede || "",
    isCreator: a.rpa_mod_creator === 1,
    isAdmin: a.rpa_mod_admin === 1,
  }));
}

export function buildActivityMap(activities: NormalizedActivity[]): Map<number, NormalizedActivity> {
  return new Map(activities.map((a) => [a.id, a]));
}
