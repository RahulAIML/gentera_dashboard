"use client";
// ============================================================
// ROLE / SCOPE STORE
// Drives hierarchy-aware visibility across the entire platform.
// ============================================================
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoleScope } from "@/lib/analytics/hierarchy";

interface ScopeStore {
  scope: RoleScope;
  setScope: (s: RoleScope) => void;
  resetScope: () => void;
}

const DEFAULT_SCOPE: RoleScope = { kind: "executive" };

export const useScopeStore = create<ScopeStore>()(
  persist(
    (set) => ({
      scope: DEFAULT_SCOPE,
      setScope: (scope) => set({ scope }),
      resetScope: () => set({ scope: DEFAULT_SCOPE }),
    }),
    { name: "gentera-scope" },
  ),
);
