"use client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchActivities, fetchSimulations, fetchMembers } from "@/lib/api/fetchers";
import {
  normalizeActivities,
  normalizeSimulations,
  normalizeMembers,
  buildActivityMap,
} from "@/lib/analytics/normalizer";
import { useFilterStore } from "@/lib/store/filterStore";
import { applyFilters } from "@/lib/analytics/kpiEngine";

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

export function useFilteredSimulations() {
  const filters = useFilterStore();
  const { simulations, isLoading, error } = useSimulations();

  const filtered = useMemo(
    () => applyFilters(simulations, filters),
    [simulations, filters]
  );

  return { simulations: filtered, isLoading, error };
}

export function useAnalytics() {
  const { simulations, isLoading, error } = useFilteredSimulations();
  const { data: activities } = useActivities();
  const { data: members } = useMembers();

  return {
    simulations,
    activities: activities ?? [],
    members: members ?? [],
    isLoading,
    error,
    totalCount: simulations.length,
  };
}
