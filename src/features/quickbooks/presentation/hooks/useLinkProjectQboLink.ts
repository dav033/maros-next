"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuickbooksApp } from "@/di";
import { quickbooksKeys } from "../../application/keys/quickbooksKeys";

/**
 * Enlaza un proyecto del CRM que ya existe con un job de QuickBooks
 * (PUT /projects/:id/qbo-link). Es el contrario de `useUnlinkProjectQboLink` y
 * se invalida igual que él: adjuntos, reporte y cifras cuelgan del vínculo y
 * quedan obsoletos de golpe, así que cae la rama entera en lugar de clave por
 * clave. Lo que vive fuera de esta rama —la ficha del proyecto, la lista de
 * jobs de la importación— lo refresca quien llama, con `onSuccess`.
 */
export function useLinkProjectQboLink() {
  const ctx = useQuickbooksApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { projectId: number; qboCustomerId: string }) =>
      ctx.repos.quickbooks.linkProject(params),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: quickbooksKeys.all });
    },
  });
}
