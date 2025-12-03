"use client";

import { useEntityForm } from "@/shared";
import type { Company } from "../../domain/models";
import type { Contact } from "@/features/contact/domain/models";
import type { CompanyFormValue } from "../molecules/CompanyForm";
import {
  initialCompanyFormValue,
  toPatch,
  mapCompanyToFormValue,
} from "../helpers/companyFormHelpers";
import { useCompanyMutations } from "./useCompanyMutations";

export interface UseCompanyEditModalOptions {
  contacts: Contact[];
}

export interface UseCompanyEditModalResult {
  isOpen: boolean;
  open: (company: Company) => void;
  close: () => void;
  formValue: CompanyFormValue;
  setFormValue: (value: CompanyFormValue | ((prev: CompanyFormValue) => CompanyFormValue)) => void;
  serverError: string | null;
  setServerError: (error: string | null) => void;
  submit: () => void;
  isSubmitting: boolean;
  currentCompany: Company | null;
}

/**
 * Hook to manage the company edit modal state and logic
 * Uses useEntityForm for standard form handling
 */
export function useCompanyEditModal({
  contacts,
}: UseCompanyEditModalOptions): UseCompanyEditModalResult {
  const { updateMutation } = useCompanyMutations();

  const {
    isOpen,
    openEdit,
    closeModal,
    formValue,
    setFormValue,
    currentEntity: currentCompany,
    serverError,
    setServerError,
    handleSubmit,
    isSubmitting,
  } = useEntityForm<Company, CompanyFormValue, ReturnType<typeof toPatch>>({
    initialFormValue: initialCompanyFormValue,
    toPatch,
    updateFn: async (id, patch) => {
      await updateMutation.mutateAsync({
        id,
        patch: patch as any,
        contactIds: formValue.contactIds,
      });
      return {} as Company; // Return value is not used since mutation handles success
    },
    invalidateKeys: [] as any, // Handled in mutation
    successMessage: "", // Handled in mutation
  });

  const open = (company: Company) => {
    openEdit(company, (c) => mapCompanyToFormValue(c, contacts));
  };

  // Wrap setFormValue to support both direct values and updater functions
  const wrappedSetFormValue = (value: CompanyFormValue | ((prev: CompanyFormValue) => CompanyFormValue)) => {
    if (typeof value === 'function') {
      setFormValue(value(formValue));
    } else {
      setFormValue(value);
    }
  };

  return {
    isOpen,
    open,
    close: closeModal,
    formValue,
    setFormValue: wrappedSetFormValue,
    serverError,
    setServerError,
    submit: handleSubmit,
    isSubmitting,
    currentCompany,
  };
}
