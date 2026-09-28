"use client";

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { useProjectsApp } from "@/di";
import {
  importQuickbooksJobsBatch,
  projectsKeys,
  quickbooksImportKeys,
} from "@/project/application";
import type {
  QuickbooksImportBatchReport,
  QuickbooksImportDecision,
} from "@/project/domain";

/**
 * El lote responde 2xx aunque rechace todas las decisiones, así que `onError`
 * sólo se dispara por un fallo de red o por un 400 del lote entero. El detalle
 * por fila vive en el informe y lo pinta la pantalla.
 */
export function useQuickbooksImportBatch(): UseMutationResult<
  QuickbooksImportBatchReport,
  Error,
  readonly QuickbooksImportDecision[]
> {
  const ctx = useProjectsApp();
  const queryClient = useQueryClient();

  return useMutation<QuickbooksImportBatchReport, Error, readonly QuickbooksImportDecision[]>({
    mutationFn: (decisions) => importQuickbooksJobsBatch(ctx, decisions),
    onSuccess: (report) => {
      // Importar crea o engancha leads y proyectos, así que la lista de
      // proyectos en caché ya no dice la verdad. `projectsKeys.all` es prefijo
      // de la clave de los jobs, así que invalidar la rama los arrastra.
      if (report.created + report.linked > 0) {
        void queryClient.invalidateQueries({ queryKey: projectsKeys.all });
        return;
      }
      void queryClient.invalidateQueries({ queryKey: quickbooksImportKeys.jobs() });
    },
  });
}
