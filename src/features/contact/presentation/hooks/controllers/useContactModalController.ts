"use client";

import { useMemo } from "react";
import type { ContactFormValue } from "@/contact/domain/mappers";

export interface UseContactModalControllerOptions {
  mode: "create" | "edit" | "list";
  closeModal: () => void;
  handleCreateSubmit: () => void;
  handleEditSubmit: () => void;
  formValue: ContactFormValue | null;
  handleFormChange: (value: ContactFormValue) => void;
  isPending: boolean;
  serverError: string | null;
}

export function useContactModalController({
  mode,
  closeModal,
  handleCreateSubmit,
  handleEditSubmit,
  formValue,
  handleFormChange,
  isPending,
  serverError,
}: UseContactModalControllerOptions) {
  return useMemo(
    () => ({
      isOpen: mode === "create" || mode === "edit",
      mode: (mode === "create" ? "create" : "edit") as "create" | "edit",
      onClose: closeModal,
      onSubmit: mode === "create" ? handleCreateSubmit : handleEditSubmit,
      formValue: formValue ?? ({} as ContactFormValue),
      onFormChange: handleFormChange,
      isLoading: isPending,
      error: serverError,
      canSubmit: (formValue?.name ?? "").trim().length > 0,
    }),
    [
      mode,
      closeModal,
      handleCreateSubmit,
      handleEditSubmit,
      formValue,
      handleFormChange,
      isPending,
      serverError,
    ]
  );
}

