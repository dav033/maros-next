"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useProjectsApp } from "@/di";
import { getProjectCostBreakdown, projectsKeys } from "@/project/application";
import type { ProjectCostBreakdown } from "@/project/domain";
import { STALE_TIMES } from "@/shared/lib/queryClient";

/**
 * Trae GET /projects/:id/cost-breakdown: lo que el proyecto ha costado en
 * material y en subcontratistas, con los proveedores dentro de cada uno.
 *
 * Se cachea como reporte porque detrás hay una consulta completa a QuickBooks
 * (la misma que alimenta el job cost), no una lectura del CRM.
 */
export function useProjectCostBreakdown(
  projectId: number,
  options?: { enabled?: boolean }
): UseQueryResult<ProjectCostBreakdown, Error> {
  const ctx = useProjectsApp();

  return useQuery<ProjectCostBreakdown, Error>({
    queryKey: [...projectsKeys.detail(projectId), "cost-breakdown"],
    queryFn: () => getProjectCostBreakdown(ctx, projectId),
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIMES.reports,
    retry: false,
  });
}
