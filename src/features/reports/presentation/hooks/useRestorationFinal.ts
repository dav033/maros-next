"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useReportsApp } from "@/di";
import { reportsKeys } from "../../application/reportKeys";
import { getRestorationFinal } from "../../application/usecases/getRestorationFinal";
import { submitRestorationFinal } from "../../application/usecases/submitRestorationFinal";
import type { RestorationFinalReport } from "../../domain/models";

export function useRestorationFinalQuery(leadNumber: string | null) {
  const ctx = useReportsApp();

  // Endpoint no existe en el backend por el momento, deshabilitado
  return useQuery({
    queryKey: reportsKeys.restorationFinal(leadNumber),
    queryFn: async () => {
      // No hacer llamada al backend, devolver datos vacíos
      return {} as any;
    },
    enabled: false, // Deshabilitado completamente
    retry: false,
    throwOnError: false,
  });
}

export function useSubmitRestorationFinalMutation() {
  const ctx = useReportsApp();

  return useMutation({
    mutationFn: (payload: RestorationFinalReport) => submitRestorationFinal(ctx, payload),
  });
}


