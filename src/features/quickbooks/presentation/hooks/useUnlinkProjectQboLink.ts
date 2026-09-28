"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuickbooksApp } from "@/di";
import { quickbooksKeys } from "../../application/keys/quickbooksKeys";

export function useUnlinkProjectQboLink() {
  const ctx = useQuickbooksApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: number) => ctx.repos.quickbooks.unlinkProject(projectId),
    onSuccess: () => {
      // Todo lo que cuelga del vínculo (adjuntos, reporte, cifras) queda obsoleto
      // de golpe, así que se invalida la rama completa en lugar de clave por clave.
      void queryClient.invalidateQueries({ queryKey: quickbooksKeys.all });
    },
  });
}
