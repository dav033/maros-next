import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompanyDraft, CompanyPatch } from "../../../domain/models";
import {
  companyKeys,
  companyCrudUseCases,
  updateCompanyWithContacts,
} from "../../../application";
import { useCompanyApp } from "@/di";
import { useToast } from "@dav033/dav-components";
import { contactsKeys } from "@/contact/application";

export function useCompanyMutations() {
  const app = useCompanyApp();
  const queryClient = useQueryClient();
  const toast = useToast();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: companyKeys.all });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    queryClient.invalidateQueries({ queryKey: contactsKeys.list });
  };

  const createMutation = useMutation({
    mutationFn: async ({
      draft,
      contactIds,
    }: {
      draft: CompanyDraft;
      contactIds?: number[];
    }) => {
      const created = await companyCrudUseCases.create(app)(draft);
      if (contactIds && contactIds.length > 0) {
        await app.repos.company.assignContacts(created.id, contactIds);
      }
      return created;
    },
    onSuccess: () => {
      invalidateQueries();
      toast.showSuccess("Company created successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not create company";
      toast.showError(message);
      throw error;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      patch,
      contactIds,
    }: {
      id: number;
      patch: CompanyPatch;
      contactIds?: number[];
    }) => {
      return await updateCompanyWithContacts(app, id, {
        companyPatch: Object.keys(patch).length > 0 ? patch : undefined,
        contactIds,
      });
    },
    onSuccess: () => {
      invalidateQueries();
      toast.showSuccess("Company updated successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not update company";
      toast.showError(message);
      throw error;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await companyCrudUseCases.delete(app)(id);
    },
    onSuccess: () => {
      invalidateQueries();
      toast.showSuccess("Company deleted successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not delete company";
      toast.showError(message);
      throw error;
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    invalidateQueries,
  };
}
