"use client";

import { useQuery } from "@tanstack/react-query";
import { useProjectsApp } from "@/di";
import { projectsKeys, listProjectsFinancials } from "@/project/application";
import type { ProjectFinancialsEntry } from "@/project/domain";

export type UseProjectsFinancialsResult = {
  financialsById: Map<number, ProjectFinancialsEntry>;
  isLoading: boolean;
  isError: boolean;
};

/**
 * Fetches the QuickBooks financial summary separately from the project list
 * (GET /projects/financials) so a slow/degraded QuickBooks never blocks
 * rendering the projects themselves. Callers merge the result into their
 * project rows by id once it arrives.
 */
export function useProjectsFinancials(options?: { enabled?: boolean }): UseProjectsFinancialsResult {
  const ctx = useProjectsApp();
  const query = useQuery<ProjectFinancialsEntry[], Error>({
    queryKey: [...projectsKeys.all, "financials"],
    queryFn: () => listProjectsFinancials(ctx),
    enabled: options?.enabled,
    // Keep the projects table synchronized with QuickBooks while it is open.
    // The API also has a short read cache, so this avoids stale financials
    // without hammering QBO on every render.
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
  });

  const financialsById = new Map((query.data ?? []).map((entry) => [entry.id, entry]));

  return {
    financialsById,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
