import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Company, CompanyPatch } from "../../domain/models";
import type { CompanyFormValue } from "../../domain/mappers";
import { toCompanyPatch } from "../../domain/mappers";
import { companyKeys, companyCrudUseCases } from "@/company";
import { companyEndpoints } from "../../infra/http/endpoints";
import { contactsKeys } from "@/contact";
import { useCompanyApp } from "@/di";
import { useToast } from "@/shared/ui";
import { optimizedApiClient } from "@/shared";

export const initialCompanyFormValue: CompanyFormValue = {
  name: "",
  address: "",
  type: null,
  serviceId: null,
  isCustomer: false,
  isClient: false,
  contactIds: [],
  notes: [],
};

export function useCompanyMutations() {
  const companyApp = useCompanyApp();
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateCompanyMutation = useMutation({
    mutationFn: (input: { id: number; patch: CompanyPatch }) =>
      companyCrudUseCases.update(companyApp)(input.id, input.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      toast.showSuccess("Company updated successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not update company";
      toast.showError(message);
      throw error;
    },
  });

  const handleDeleteCompany = async (companyId: number) => {
    try {
      await companyCrudUseCases.delete(companyApp)(companyId);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      toast.showSuccess("Company deleted successfully!");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not delete company";
      toast.showError(message);
    }
  };

  const assignContacts = async (companyId: number, contactIds: number[]) => {
    try {
      await optimizedApiClient.post(
        companyEndpoints.assignContacts(companyId),
        contactIds || []
      );
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not assign contacts";
      toast.showError(message);
      throw error;
    }
  };

  return {
    updateCompanyMutation,
    handleDeleteCompany,
    assignContacts,
    toCompanyPatch,
  };
}
