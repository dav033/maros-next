"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLead, leadsKeys } from "@/leads/application";
import { useLeadsApp } from "@/di";
import { useToast } from "@dav033/dav-components";

export function useLeadsMutations() {
  const app = useLeadsApp();
  const queryClient = useQueryClient();
  const toast = useToast();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: leadsKeys.all });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await deleteLead(app, id);
    },
    onSuccess: () => {
      invalidateQueries();
      toast.showSuccess("Lead deleted successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not delete lead";
      toast.showError(message);
      throw error;
    },
  });

  return {
    deleteMutation,
    invalidateQueries,
  };
}

