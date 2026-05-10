// ============================================================
// GENTERA CONVERSATIONAL INTELLIGENCE PLATFORM
// Centralized Type Contracts — all components consume these
// ============================================================

// ---- Raw API Responses --------------------------------------------------------

export interface RawActivity {
  ID_Caso_de_Uso: number;
  Caso_de_Uso: string;
  Actividad_Nombre: string;
}

export type RawPuntos = 0 | 1 | "No aplica";

export interface RawSimulation {
  ID_Sim: number;
  ID_Caso_de_Uso: number;
  Fecha_y_Hora: string;
  Usuario: string | null;
  Usuario_Nombre: string;
  Calificacion: number;
  Diagnostico_Final: "Si" | "No";
  Puntos_Totales: number;
  Pregunta_1: string; Pregunta_2: string; Pregunta_3: string;
  Pregunta_4: string; Pregunta_5: string; Pregunta_6: string;
  Respuesta_1: string; Respuesta_2: string; Respuesta_3: string;
  Respuesta_4: string; Respuesta_5: string; Respuesta_6: string;
  Puntos_1: RawPuntos; Puntos_2: RawPuntos; Puntos_3: RawPuntos;
  Puntos_4: RawPuntos; Puntos_5: RawPuntos; Puntos_6: RawPuntos;
  Retroalimentacion_1: string; Retroalimentacion_2: string; Retroalimentacion_3: string;
  Retroalimentacion_4: string; Retroalimentacion_5: string; Retroalimentacion_6: string;
}

export interface RawMember {
  mb_id: number;
  mb_fullname: string;
  mb_email: string;
  mb_user: string;
  mb_status: number;
  mb_admin: number;
  mb_line: string;
  mb_branch: string;
  mb_city: string;
  mb_state: string;
  mb_country: string;
  mb_designation: string;
  mb_employee_code: string;
  mb_reference: string;
  mb_route: string;
  mb_date_create: string;
  mb_last_login: string;
  mb_idTag1: number;
  mb_idTag2: number;
  mb_idTag3: number;
  mb_idDepartament: number;
  memberscol: null;
}

export interface RawAdmin {
  rpa_id: number;
  rpa_full_name: string;
  rpa_email: string;
  rpa_user: string;
  rpa_profile_type: string;
  rpa_parent: number;
  rpa_sede: string;
  rpa_company: string;
  rpa_create_date: string;
  rpa_is_demo: number;
  rpa_enabled_ae: number;
  rpa_enabled_stt: number;
  rpa_mod_admin: number;
  rpa_mod_admin_global: number;
  rpa_mod_creator: number;
  rpa_mod_doedit: number;
  rp_assoc_tenant: number;
}

export interface RawActivitiesResponse {
  current_page: number;
  page_size: number;
  total_pages: number;
  total_records: number;
  data: RawActivity[];
}

export interface RawMembersResponse {
  client: string;
  count: number;
  data: RawMember[];
}

export interface RawAdminsResponse {
  client: string;
  count: number;
  data: RawAdmin[];
}

// ---- Normalized Analytics Contracts ------------------------------------------

export interface NormalizedActivity {
  id: number;
  name: string;
  slug: string;
}

export interface InteractionRound {
  index: number;           // 1-6
  prompt: string;
  response: string;
  score: number | null;    // null when "No aplica"
  feedback: string | null; // null when "No aplica"
  applicable: boolean;
}

export interface NormalizedSimulation {
  id: number;
  activityId: number;
  activityName: string;
  activitySlug: string;
  timestamp: Date;
  userName: string;
  userId: string | null;
  score: number;              // 0-100
  passed: boolean;
  totalPoints: number;
  maxApplicablePoints: number;
  rounds: InteractionRound[];
  monthKey: string;           // "2025-10"
  weekKey: string;            // "2025-W41"
  dateKey: string;            // "2025-10-03"
}

export interface NormalizedMember {
  id: number;
  name: string;
  email: string;
  userId: string;
  adminId: number;            // mb_admin — links participant to admin
  status: "active" | "inactive";
  line: string;
  branch: string;
  city: string;
  state: string;
  designation: string;
  employeeCode: string;
  lastLogin: Date | null;
  createdAt: Date;
}

export type AdminProfile = "tenant" | "supervisor" | "admin" | "dev" | "other";

export interface NormalizedAdmin {
  id: number;
  name: string;
  email: string;
  profileType: AdminProfile;
  rawProfile: string;
  parentId: number;
  sede: string;
  isCreator: boolean;
  isAdmin: boolean;
}

// ---- Hierarchy ---------------------------------------------------------------

export interface AdminNode {
  admin: NormalizedAdmin;
  participants: NormalizedMember[];      // members with mb_admin === admin.id
  participantIds: Set<number>;
  participantUserIds: Set<string>;       // mb_user lowercased — used to match simulations
}

export interface SupervisorNode {
  supervisor: NormalizedAdmin;
  admins: AdminNode[];
  participantIds: Set<number>;
  participantUserIds: Set<string>;
}

export interface GenteraHierarchy {
  supervisors: SupervisorNode[];
  unsupervisedAdmins: AdminNode[];       // admins whose parent isn't a supervisor
  byAdminId: Map<number, AdminNode>;
  bySupervisorId: Map<number, SupervisorNode>;
  totals: {
    supervisors: number;
    admins: number;
    participants: number;
    orphanParticipants: number;          // participants whose admin isn't found
  };
}

// ---- KPI Types ---------------------------------------------------------------

export interface KPISummary {
  totalSimulations: number;
  uniqueUsers: number;
  averageScore: number;
  passRate: number;           // 0-1
  totalActivities: number;
  activeDays: number;
  trend: {
    simulationsDelta: number; // % change vs prev period
    scoreDelta: number;
    passRateDelta: number;
  };
}

export interface ActivityKPI {
  activityId: number;
  activityName: string;
  activitySlug: string;
  simulationCount: number;
  uniqueUsers: number;
  averageScore: number;
  passRate: number;
}

export interface UserKPI {
  userName: string;
  userId: string | null;
  simulationCount: number;
  averageScore: number;
  bestScore: number;
  passRate: number;
  latestSimulation: Date;
  activityIds: number[];
}

export interface InteractionKPI {
  roundIndex: number;
  label: string;
  passRate: number;   // 0-1 of applicable sims
  avgScore: number;   // avg of 0/1 where applicable
  totalApplicable: number;
  totalPassed: number;
}

export interface TrendDataPoint {
  period: string;
  label: string;
  simulations: number;
  averageScore: number;
  passRate: number;
  uniqueUsers: number;
}

export interface ScoreDistributionBucket {
  range: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
}

// ---- AI Insight Types --------------------------------------------------------

export type InsightSeverity = "info" | "warning" | "critical" | "success";

export interface AIInsight {
  id: string;
  type: "opportunity" | "anomaly" | "trend" | "achievement" | "risk";
  severity: InsightSeverity;
  title: string;
  description: string;
  metric?: string;
  delta?: number;
  relatedEntity?: string;
}

// ---- Filter State ------------------------------------------------------------

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface FilterState {
  dateRange: DateRange;
  activityIds: number[];
  userName: string;
  minScore: number | null;
  maxScore: number | null;
  diagnosisFilter: "all" | "passed" | "failed";
}

// ---- Chart Data Contracts ----------------------------------------------------

export interface ChartDataPoint {
  [key: string]: string | number | undefined;
}

export interface LeaderboardEntry {
  rank: number;
  userName: string;
  userId: string | null;
  simulations: number;
  avgScore: number;
  passRate: number;
  trend: "up" | "down" | "stable";
  badge?: "gold" | "silver" | "bronze";
}

export interface HeatmapCell {
  day: string;
  hour: number;
  count: number;
  avgScore: number;
}
