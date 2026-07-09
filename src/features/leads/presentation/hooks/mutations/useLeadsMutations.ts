"use client";

import { useQueryClient } from "@tanstack/react-query";

import { useEntityMutation } from "@/shared/presentation";
import { leadsKeys } from "@/leads/application";
import { projectsKeys } from "@/project/application";
import { LeadStatus } from "@/leads/domain";

import {
  acceptLeadAction,
  deleteLeadAction,
  updateLeadStatusAction,
  updateLeadProjectTypeAction,
} from "../../../actions/leadActions";

export interface DeleteLeadOptions {
  id: number;
  deleteContact?: boolean;
  deleteCompany?: boolean;
}

/**
 * Hook que expone mutaciones de TanStack Query para operaciones sobre leads.
 *
 * Retorna cuatro mutaciones preconfiguradas con invalidación automática de caché:
 * - `deleteMutation`: elimina un lead (con opción de eliminar contacto/empresa asociados).
 * - `acceptMutation`: marca un lead como aceptado (inReview = false).
 * - `updateStatusMutation`: cambia el estado (LeadStatus) de un lead.
 * - `updateProjectTypeMutation`: cambia el tipo de proyecto de un lead.
 *
 * @returns Objeto con las mutaciones y el helper `invalidateQueries`.
 */
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

  const updateStatusMutation = useEntityMutation<{ id: number; status: LeadStatus }, void>({
    entityLabel: "Lead",
    action: "updated",
    successMessage: "Lead status updated successfully!",
    mutationFn: ({ id, status }) => updateLeadStatusAction(id, status),
    invalidate: (qc, _, { status }) => {
      void qc.invalidateQueries({ queryKey: leadsKeys.all });
      if (status === LeadStatus.WON) {
        void qc.invalidateQueries({ queryKey: projectsKeys.all });
      }
    },
  });

  const updateProjectTypeMutation = useEntityMutation<{ id: number; projectTypeId: number }, void>({
    entityLabel: "Lead",
    action: "updated",
    successMessage: "Lead project type updated successfully!",
    mutationFn: ({ id, projectTypeId }) => updateLeadProjectTypeAction(id, projectTypeId),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: leadsKeys.all });
    },
  });

  return {
    deleteMutation,
    acceptMutation,
    updateStatusMutation,
    updateProjectTypeMutation,
    invalidateQueries,
  };
}
