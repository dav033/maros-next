"use client";

import { useMemo } from "react";

export interface UseContactCompanyModalControllerOptions {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formValue: any;
  onChange: (value: any) => void;
  isSubmitting: boolean;
  serverError: string | null;
}

export function useContactCompanyModalController({
  isOpen,
  onClose,
  onSubmit,
  formValue,
  onChange,
  isSubmitting,
  serverError,
}: UseContactCompanyModalControllerOptions) {
  return useMemo(
    () => ({
      isOpen,
      mode: "create" as const,
      onClose,
      onSubmit,
      formValue,
      onChange,
      isSubmitting,
      serverError,
    }),
    [isOpen, onClose, onSubmit, formValue, onChange, isSubmitting, serverError]
  );
}

