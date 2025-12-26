import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompanyDraft, CompanyPatch } from "../../../domain/models";
import { companyKeys } from "../../../application";
import { useToast } from "@dav033/dav-components";
import { contactsKeys } from "@/contact/application";
import {
  createCompanyAction,
  updateCompanyAction,
  deleteCompanyAction,
} from "../../../actions/companyActions";

export function useCompanyMutations() {
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
      const result = await createCompanyAction(draft, contactIds);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
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
      const result = await updateCompanyAction(id, patch, contactIds);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
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
      const result = await deleteCompanyAction(id);
      if (!result.success) {
        throw new Error(result.error);
      }
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
