"use client";

import { useQueryClient } from "@tanstack/react-query";

import { useEntityMutation } from "@/shared/presentation";
import { optimisticRemove } from "@/shared/query/optimistic";
import { contactsKeys } from "@/contact/application";

import { companyKeys } from "../../../application";
import type { Company, CompanyDraft, CompanyPatch } from "../../../domain/models";
import {
  createCompanyAction,
  deleteCompanyAction,
  updateCompanyAction,
} from "../../../actions/companyActions";

type CreateInput = { draft: CompanyDraft; contactIds?: number[] };
type UpdateInput = { id: number; patch: CompanyPatch; contactIds?: number[] };

export function useCompanyMutations() {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    void queryClient.invalidateQueries({ queryKey: companyKeys.all });
    void queryClient.invalidateQueries({ queryKey: ["customers"] });
    void queryClient.invalidateQueries({ queryKey: contactsKeys.list });
  };

  const createMutation = useEntityMutation<CreateInput, Company>({
    entityLabel: "Company",
    action: "created",
    mutationFn: ({ draft, contactIds }) => createCompanyAction(draft, contactIds),
    invalidate: invalidateQueries,
  });

  const updateMutation = useEntityMutation<UpdateInput, Company>({
    entityLabel: "Company",
    action: "updated",
    mutationFn: ({ id, patch, contactIds }) =>
      updateCompanyAction(id, patch, contactIds),
    invalidate: invalidateQueries,
  });

  const deleteMutation = useEntityMutation<number, void>({
    entityLabel: "Company",
    action: "deleted",
    mutationFn: (id) => deleteCompanyAction(id),
    optimistic: (qc, id) =>
      optimisticRemove<Company, number>(qc, {
        listKey: companyKeys.lists(),
        detailKey: companyKeys.detail(id),
        id,
      }),
    invalidate: invalidateQueries,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    invalidateQueries,
  };
}
