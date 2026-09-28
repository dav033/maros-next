"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useProjectsApp } from "@/di";
import { getProjectQboReport, projectsKeys } from "@/project/application";
import type { ProjectQboReport, QboReportParams } from "@/project/domain";
import { STALE_TIMES } from "@/shared/lib/queryClient";

/**
 * Trae GET /projects/:id/qbo-report. El payload es el de QuickBooks tal cual,
 * así que se cachea como reporte (30 min) y sólo se vuelve a pedir cuando
 * cambian el reporte, el método contable o las fechas.
 */
export function useProjectQboReport(
  projectId: number,
  params: QboReportParams,
  options?: { enabled?: boolean }
): UseQueryResult<ProjectQboReport, Error> {
  const ctx = useProjectsApp();

  return useQuery<ProjectQboReport, Error>({
    queryKey: [...projectsKeys.detail(projectId), "qbo-report", params],
    queryFn: () => getProjectQboReport(ctx, projectId, params),
    enabled: options?.enabled,
    staleTime: STALE_TIMES.reports,
    retry: false,
  });
}
