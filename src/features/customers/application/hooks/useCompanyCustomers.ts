"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Contact } from "@/contact/domain";
import type { Company } from "@/company/domain";
import { useCompanyApp } from "@/di";
import { 
  companyKeys, 
  companyCrudUseCases, 
  updateCompanyWithContacts,
  type UpdateCompanyWithContactsInput 
} from "@/company/application";
import { contactsKeys } from "@/contact/application";
import { useToast } from "@/shared/ui";
import { customersKeys } from "../../infra/keys";
import { 
  initialCompanyFormValue, 
  toCompanyPatch, 
  mapCompanyToFormValue 
} from "../../presentation/helpers/companyHelpers";
import type { CompanyFormValue } from "@/features/company/presentation/molecules/CompanyForm";

interface UseCompanyCustomersOptions {
  contacts: Contact[];
}

export function useCompanyCustomers({ contacts }: UseCompanyCustomersOptions) {
  const companyApp = useCompanyApp();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [formValue, setFormValue] = useState<CompanyFormValue>(initialCompanyFormValue);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openEdit = useCallback(
    (company: Company, formMapper: (company: Company) => CompanyFormValue) => {
      setCurrentCompany(company);
      setFormValue(formMapper(company));
      setServerError(null);
      setIsOpen(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    if (isSubmitting) return;
    setIsOpen(false);
    setCurrentCompany(null);
    setServerError(null);
    setFormValue(initialCompanyFormValue);
  }, [isSubmitting]);

  const handleDeleteCompany = useCallback(
    async (companyId: number) => {
      try {
        await companyCrudUseCases.delete(companyApp)(companyId);
        queryClient.invalidateQueries({ queryKey: customersKeys.all });
        queryClient.invalidateQueries({ queryKey: companyKeys.all });
        toast.showSuccess("Company deleted successfully!");
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Could not delete company";
        toast.showError(message);
      }
    },
    [companyApp, queryClient, toast]
  );

  const handleCompanySubmit = useCallback(
    async () => {
      if (!currentCompany) {
        return;
      }

      const patch = toCompanyPatch(currentCompany, formValue);
      const hasChanges = Object.keys(patch).length > 0;
      const hasContactChanges = formValue.contactIds !== undefined;

      if (!hasChanges && !hasContactChanges) {
        setServerError("No changes detected");
        return;
      }

      setIsSubmitting(true);
      setServerError(null);

      try {
        const input: UpdateCompanyWithContactsInput = {
          companyPatch: hasChanges ? patch : undefined,
          contactIds: hasContactChanges ? formValue.contactIds : undefined,
        };

        await updateCompanyWithContacts(companyApp, currentCompany.id, input);

        queryClient.invalidateQueries({ queryKey: customersKeys.all });
        queryClient.invalidateQueries({ queryKey: companyKeys.all });
        queryClient.invalidateQueries({ queryKey: contactsKeys.list });

        toast.showSuccess("Company updated successfully!");
        closeModal();
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not update company";
        setServerError(message);
        toast.showError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      currentCompany,
      formValue,
      companyApp,
      queryClient,
      toast,
      closeModal,
      setServerError,
    ]
  );

  const handleEditCompany = useCallback(
    (company: Company) => {
      openEdit(company, (c) => mapCompanyToFormValue(c, contacts));
    },
    [contacts, openEdit]
  );

  return {
    modal: {
      isOpen,
      closeModal,
      formValue,
      setFormValue,
      currentCompany,
      serverError,
      isSubmitting,
    },
    handlers: {
      handleDeleteCompany,
      handleCompanySubmit,
      handleEditCompany,
    },
  };
}
