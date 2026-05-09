// ============================================================
// CENTRALIZED ENDPOINT REGISTRY
// All API URLs and activity IDs live here — never hardcoded elsewhere
// ============================================================

export const ACTIVITY_IDS = [82, 102, 121, 122, 123, 124, 125, 126, 127] as const;

const BASE = "https://serv.aux-rolplay.com/gentera/api";
const ORG = "rolplay_gentera_robin";

function activityParams(): string {
  return ACTIVITY_IDS.map((id) => `id=${id}`).join("&");
}

export const ENDPOINTS = {
  activities: () => `${BASE}/dim_actividades?${activityParams()}`,
  simulations: () => `${BASE}/rol_play_sim_extractor?${activityParams()}`,
  members: () => `${BASE}/data/${ORG}/members`,
  admins: () => `${BASE}/data/${ORG}/administrators`,
} as const;

export type EndpointKey = keyof typeof ENDPOINTS;
