"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsKeys } from "@/leads/application";
import { toast } from "sonner";
import { deleteLeadAction, acceptLeadAction } from "../../../actions/leadActions";

export interface DeleteLeadOptions {
  id: number;
  deleteContact?: boolean;
  deleteCompany?: boolean;
}

export function useLeadsMutations() {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: leadsKeys.all });
  };

  const deleteMutation = useMutation({
    mutationFn: async (options: number | DeleteLeadOptions) => {
      const id = typeof options === 'number' ? options : options.id;
      const deleteOptions = typeof options === 'number' ? undefined : {
        deleteContact: options.deleteContact,
        deleteCompany: options.deleteCompany,
      };
      const result = await deleteLeadAction(id, deleteOptions);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      invalidateQueries();
      toast.success("Lead deleted successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not delete lead";
      toast.error(message);
      throw error;
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await acceptLeadAction(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      invalidateQueries();
      toast.success("Lead accepted successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not accept lead";
      toast.error(message);
      throw error;
    },
  });

  return {
    deleteMutation,
    acceptMutation,
    invalidateQueries,
  };
}

