"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useReportsApp } from "@/di";
import { reportsKeys } from "../../application/reportKeys";
import { getRestorationVisit } from "../../application/usecases/getRestorationVisit";
import { submitRestorationVisit } from "../../application/usecases/submitRestorationVisit";
import type { RestorationVisitReport } from "../../domain/models";

export function useRestorationVisitQuery(leadNumber: string | null) {
  const ctx = useReportsApp();

  // Endpoint no existe en el backend por el momento, deshabilitado
  return useQuery({
    queryKey: reportsKeys.restorationVisit(leadNumber),
    queryFn: async () => {
      // No hacer llamada al backend, devolver datos vacíos
      return {} as any;
    },
    enabled: false, // Deshabilitado completamente
    retry: false,
    throwOnError: false,
  });
}

export function useSubmitRestorationVisitMutation() {
  const ctx = useReportsApp();

  return useMutation({
    mutationFn: (payload: RestorationVisitReport) => submitRestorationVisit(ctx, payload),
  });
}


