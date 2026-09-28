"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useProjectsApp } from "@/di";
import { listQuickbooksImportJobs, quickbooksImportKeys } from "@/project/application";
import type { QuickbooksImportJob } from "@/project/domain";

/**
 * Trae GET /projects/quickbooks-import/jobs. El diagnóstico (estado, papel,
 * colisiones) se calcula contra QuickBooks y el CRM en ese momento, así que
 * cachearlo engaña: quien abre la pantalla va a escribir a partir de lo que ve.
 */
export function useQuickbooksImportJobs(): UseQueryResult<QuickbooksImportJob[], Error> {
  const ctx = useProjectsApp();

  return useQuery<QuickbooksImportJob[], Error>({
    queryKey: quickbooksImportKeys.jobs(),
    queryFn: () => listQuickbooksImportJobs(ctx),
    staleTime: 0,
    refetchOnMount: true,
  });
}
