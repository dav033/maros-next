"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProjectsApp } from "@/di";
import { projectsKeys, listProjectsFinancials } from "@/project/application";
import type { Project, ProjectFinancialsEntry } from "@/project/domain";

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
    refetchInterval: 20_000,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    staleTime: 5_000,
    gcTime: 10 * 60 * 1000,
  });

  // Memoizado: quien lo consume arma las filas de la tabla con él, y un Map
  // nuevo en cada render volvería a crear esas filas render tras render.
  const financialsById = useMemo(
    () => new Map((query.data ?? []).map((entry) => [entry.id, entry])),
    [query.data],
  );

  return {
    financialsById,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/**
 * Aplica a un project la fila de GET /projects/financials que le corresponde.
 * Devuelve el mismo objeto si todavía no hay datos para ese id, para no
 * invalidar filas de tabla que no cambiaron.
 */
export function mergeProjectFinancials(
  project: Project,
  financialsById: Map<number, ProjectFinancialsEntry>,
): Project {
  const entry = financialsById.get(project.id);
  if (!entry) return project;

  return {
    ...project,
    financial: entry.financial ?? undefined,
    paymentSummary: entry.paymentSummary ?? project.paymentSummary,
    invoiceStatus: entry.invoiceStatus ?? project.invoiceStatus,
    qboError: entry.qboError,
  };
}
