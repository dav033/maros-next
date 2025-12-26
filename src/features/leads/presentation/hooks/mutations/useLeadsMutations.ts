"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsKeys } from "@/leads/application";
import { useToast } from "@dav033/dav-components";
import { deleteLeadAction } from "../../../actions/leadActions";

export function useLeadsMutations() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: leadsKeys.all });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteLeadAction(id);
      if (!result.success) {
        throw new Error(result.error);
      }
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

