"use client";

import { useQueryClient } from "@tanstack/react-query";

import { useEntityMutation } from "@/shared/presentation";
import { leadsKeys } from "@/leads/application";

import {
  acceptLeadAction,
  deleteLeadAction,
} from "../../../actions/leadActions";

export interface DeleteLeadOptions {
  id: number;
  deleteContact?: boolean;
  deleteCompany?: boolean;
}

export function useLeadsMutations() {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    void queryClient.invalidateQueries({ queryKey: leadsKeys.all });
  };

  const deleteMutation = useEntityMutation<number | DeleteLeadOptions, void>({
    entityLabel: "Lead",
    action: "deleted",
    mutationFn: (options) => {
      const id = typeof options === "number" ? options : options.id;
      const opts =
        typeof options === "number"
          ? undefined
          : { deleteContact: options.deleteContact, deleteCompany: options.deleteCompany };
      return deleteLeadAction(id, opts);
    },
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: leadsKeys.all });
    },
  });

  const acceptMutation = useEntityMutation<number, void>({
    entityLabel: "Lead",
    action: "updated",
    successMessage: "Lead accepted successfully!",
    mutationFn: (id) => acceptLeadAction(id),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: leadsKeys.all });
    },
  });

  return {
    deleteMutation,
    acceptMutation,
    invalidateQueries,
  };
}
