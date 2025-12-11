"use client";

import { useState } from "react";
import type { CompanyFormValue } from "../../molecules/CompanyForm";
import { initialCompanyFormValue, toDraft } from "../../helpers/companyFormHelpers";
import { useCompanyMutations } from "../mutations/useCompanyMutations";

export interface UseCompanyCreateModalResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  formValue: CompanyFormValue;
  setFormValue: (value: CompanyFormValue | ((prev: CompanyFormValue) => CompanyFormValue)) => void;
  serverError: string | null;
  setServerError: (error: string | null) => void;
  submit: () => Promise<void>;
  isSubmitting: boolean;
}


export function useCompanyCreateModal(): UseCompanyCreateModalResult {
  const { createMutation } = useCompanyMutations();

  const [isOpen, setIsOpen] = useState(false);
  const [formValue, setFormValue] = useState<CompanyFormValue>(initialCompanyFormValue);
  const [serverError, setServerError] = useState<string | null>(null);

  const open = () => {
    setFormValue(initialCompanyFormValue);
    setServerError(null);
    setIsOpen(true);
  };

  const close = () => {
    if (createMutation.isPending) return;
    setIsOpen(false);
    setServerError(null);
    setFormValue(initialCompanyFormValue);
  };

  const submit = async () => {
    const draft = toDraft(formValue);
    if (!draft.name) {
      setServerError("Name is required");
      return;
    }

    try {
      await createMutation.mutateAsync({
        draft,
        contactIds: formValue.contactIds,
      });
      close();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not create company";
      setServerError(message);
    }
  };

 
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
    close,
    formValue,
    setFormValue: wrappedSetFormValue,
    serverError,
    setServerError,
    submit,
    isSubmitting: createMutation.isPending,
  };
}
