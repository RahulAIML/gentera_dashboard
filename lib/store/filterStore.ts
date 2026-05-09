"use client";
import { create } from "zustand";
import { subMonths, startOfDay, endOfDay } from "date-fns";
import type { FilterState } from "@/types/analytics";

interface FilterStore extends FilterState {
  setDateRange: (start: Date | null, end: Date | null) => void;
  setActivityIds: (ids: number[]) => void;
  setUserName: (name: string) => void;
  setMinScore: (score: number | null) => void;
  setMaxScore: (score: number | null) => void;
  setDiagnosisFilter: (f: FilterState["diagnosisFilter"]) => void;
  resetFilters: () => void;
}

const DEFAULT: FilterState = {
  dateRange: { start: subMonths(new Date(), 6), end: endOfDay(new Date()) },
  activityIds: [],
  userName: "",
  minScore: null,
  maxScore: null,
  diagnosisFilter: "all",
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...DEFAULT,
  setDateRange: (start, end) =>
    set((s) => ({ dateRange: { start, end } })),
  setActivityIds: (ids) => set({ activityIds: ids }),
  setUserName: (name) => set({ userName: name }),
  setMinScore: (score) => set({ minScore: score }),
  setMaxScore: (score) => set({ maxScore: score }),
  setDiagnosisFilter: (f) => set({ diagnosisFilter: f }),
  resetFilters: () => set(DEFAULT),
}));
