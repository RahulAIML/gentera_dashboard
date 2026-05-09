import type {
  RawActivity,
  RawSimulation,
  RawMember,
  RawAdmin,
  RawActivitiesResponse,
  RawMembersResponse,
  RawAdminsResponse,
} from "@/types/analytics";
import { ENDPOINTS } from "./endpoints";

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

export async function fetchActivities(): Promise<RawActivity[]> {
  const data = await apiFetch<RawActivitiesResponse>(ENDPOINTS.activities());
  return data.data ?? [];
}

export async function fetchSimulations(): Promise<RawSimulation[]> {
  const data = await apiFetch<RawSimulation[]>(ENDPOINTS.simulations());
  return Array.isArray(data) ? data : [];
}

export async function fetchMembers(): Promise<RawMember[]> {
  const data = await apiFetch<RawMembersResponse>(ENDPOINTS.members());
  return data.data ?? [];
}

export async function fetchAdmins(): Promise<RawAdmin[]> {
  const data = await apiFetch<RawAdminsResponse>(ENDPOINTS.admins());
  return data.data ?? [];
}
