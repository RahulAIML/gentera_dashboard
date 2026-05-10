// All fetches go through Next.js API proxy routes to avoid CORS
// The proxy routes (app/api/analytics/*) call the external APIs server-side
import type {
  RawActivity,
  RawSimulation,
  RawMember,
  RawAdmin,
  RawActivitiesResponse,
  RawMembersResponse,
  RawAdminsResponse,
} from "@/types/analytics";

const PROXY = "/api/analytics";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchActivities(): Promise<RawActivity[]> {
  const data = await apiFetch<RawActivitiesResponse>(`${PROXY}/activities`);
  return data.data ?? [];
}

export async function fetchSimulations(): Promise<RawSimulation[]> {
  const data = await apiFetch<RawSimulation[]>(`${PROXY}/simulations`);
  return Array.isArray(data) ? data : [];
}

export async function fetchMembers(): Promise<RawMember[]> {
  const data = await apiFetch<RawMembersResponse>(`${PROXY}/members`);
  return data.data ?? [];
}

export async function fetchAdmins(): Promise<RawAdmin[]> {
  const data = await apiFetch<RawAdminsResponse>(`${PROXY}/admins`);
  return data.data ?? [];
}
