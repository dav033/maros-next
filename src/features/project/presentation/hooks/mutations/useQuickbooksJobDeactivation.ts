"use client";

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { useProjectsApp } from "@/di";
import { deactivateQuickbooksJob, quickbooksImportKeys } from "@/project/application";
import type { QuickbooksJobDeactivation } from "@/project/domain";

/**
 * POST /projects/quickbooks-import/deactivate-job.
 *
 * El backend sirve la lista filtrando `Active = true`, así que un job recién
 * desactivado tiene que desaparecer de la pantalla: sin invalidar la consulta
 * seguiría ahí, ofreciendo acciones sobre algo que ya no está en las listas de
 * QuickBooks.
 */
export function useQuickbooksJobDeactivation(): UseMutationResult<
  QuickbooksJobDeactivation,
  Error,
  string
> {
  const ctx = useProjectsApp();
  const queryClient = useQueryClient();

  return useMutation<QuickbooksJobDeactivation, Error, string>({
    mutationFn: (qboCustomerId) => deactivateQuickbooksJob(ctx, qboCustomerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: quickbooksImportKeys.jobs() });
    },
  });
}
