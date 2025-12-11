"use client";

import { useMemo } from "react";
import type { ContactFormValue } from "@/features/contact/domain/mappers";

export interface UseCompanyContactModalControllerOptions {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formValue: ContactFormValue;
  onFormChange: (value: ContactFormValue) => void;
  isLoading: boolean;
  error: string | null;
}

export function useCompanyContactModalController({
  isOpen,
  onClose,
  onSubmit,
  formValue,
  onFormChange,
  isLoading,
  error,
}: UseCompanyContactModalControllerOptions) {
  return useMemo(
    () => ({
      isOpen,
      mode: "create" as const,
      onClose,
      onSubmit,
      formValue,
      onFormChange,
      isLoading,
      error,
      canSubmit: formValue.name.trim().length > 0,
    }),
    [isOpen, onClose, onSubmit, formValue, onFormChange, isLoading, error]
  );
}

