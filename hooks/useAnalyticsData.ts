"use client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchActivities, fetchSimulations, fetchMembers, fetchAdmins } from "@/lib/api/fetchers";
import {
  normalizeActivities,
  normalizeSimulations,
  normalizeMembers,
  normalizeAdmins,
  buildActivityMap,
} from "@/lib/analytics/normalizer";
import { useFilterStore } from "@/lib/store/filterStore";
import { useScopeStore } from "@/lib/store/scopeStore";
import { applyFilters } from "@/lib/analytics/kpiEngine";
import {
  buildHierarchy,
  resolveScopeLocalized,
  filterSimulationsByScope,
  filterMembersByScope,
} from "@/lib/analytics/hierarchy";
import { useI18n } from "@/lib/i18n";

export function useActivities() {
  return useQuery({
    queryKey: ["activities"],
    queryFn: fetchActivities,
    staleTime: 1000 * 60 * 10,
    select: normalizeActivities,
  });
}

export function useRawSimulations() {
  return useQuery({
    queryKey: ["simulations"],
    queryFn: fetchSimulations,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMembers() {
  return useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
    staleTime: 1000 * 60 * 10,
    select: normalizeMembers,
  });
}

export function useSimulations() {
  const { data: rawSims, isLoading: simsLoading, error: simsError } = useRawSimulations();
  const { data: activities, isLoading: actsLoading } = useActivities();

  const normalized = useMemo(() => {
    if (!rawSims || !activities) return [];
    const actMap = buildActivityMap(activities);
    return normalizeSimulations(rawSims, actMap);
  }, [rawSims, activities]);

  return {
    simulations: normalized,
    isLoading: simsLoading || actsLoading,
    error: simsError,
  };
}

export function useAdmins() {
  return useQuery({
    queryKey: ["admins"],
    queryFn: fetchAdmins,
    staleTime: 1000 * 60 * 10,
    select: normalizeAdmins,
  });
}

export function useHierarchy() {
  const { data: admins } = useAdmins();
  const { data: members } = useMembers();
  return useMemo(() => {
    if (!admins || !members) return null;
    return buildHierarchy(admins, members);
  }, [admins, members]);
}

export function useResolvedScope() {
  const scope = useScopeStore((s) => s.scope);
  const { locale } = useI18n();
  const hierarchy = useHierarchy();
  return useMemo(() => {
    if (!hierarchy) return null;
    return resolveScopeLocalized(scope, hierarchy, locale);
  }, [scope, hierarchy, locale]);
}

export function useFilteredSimulations() {
  const filters = useFilterStore();
  const { simulations, isLoading, error } = useSimulations();
  const resolved = useResolvedScope();

  const filtered = useMemo(() => {
    const scoped = resolved ? filterSimulationsByScope(simulations, resolved) : simulations;
    return applyFilters(scoped, filters);
  }, [simulations, filters, resolved]);

  return { simulations: filtered, isLoading, error };
}

export function useAnalytics() {
  const { simulations, isLoading, error } = useFilteredSimulations();
  const { data: activities } = useActivities();
  const { data: members } = useMembers();
  const resolved = useResolvedScope();

  const scopedMembers = useMemo(() => {
    if (!members) return [];
    return resolved ? filterMembersByScope(members, resolved) : members;
  }, [members, resolved]);

  return {
    simulations,
    activities: activities ?? [],
    members: scopedMembers,
    isLoading,
    error,
    totalCount: simulations.length,
    scope: resolved,
  };
}
