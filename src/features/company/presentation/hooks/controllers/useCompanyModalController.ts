"use client";

import { useMemo } from "react";

export interface UseCompanyModalControllerOptions {
  createModal: {
    isOpen: boolean;
    close: () => void;
    submit: () => Promise<void>;
    formValue: any;
    setFormValue: (value: any) => void;
    isSubmitting: boolean;
    serverError: string | null;
  };
  editModal: {
    isOpen: boolean;
    close: () => void;
    submit: () => void;
    formValue: any;
    setFormValue: (value: any) => void;
    isSubmitting: boolean;
    serverError: string | null;
  };
}

export function useCompanyModalController({
  createModal,
  editModal,
}: UseCompanyModalControllerOptions) {
  return useMemo(
    () => ({
      isOpen: createModal.isOpen || editModal.isOpen,
      mode: (createModal.isOpen ? "create" : "update") as "create" | "update",
      onClose: createModal.isOpen ? createModal.close : editModal.close,
      onSubmit: createModal.isOpen ? createModal.submit : editModal.submit,
      formValue: createModal.isOpen ? createModal.formValue : editModal.formValue,
      onChange: createModal.isOpen
        ? createModal.setFormValue
        : editModal.setFormValue,
      isSubmitting: createModal.isOpen
        ? createModal.isSubmitting
        : editModal.isSubmitting,
      serverError: createModal.isOpen
        ? createModal.serverError
        : editModal.serverError,
    }),
    [createModal, editModal]
  );
}

