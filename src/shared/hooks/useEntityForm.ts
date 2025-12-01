"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/ui";

export interface UseEntityFormOptions<T, TFormValue, TPatch> {
  initialFormValue: TFormValue;
  toPatch: (current: T, value: TFormValue) => TPatch;
  updateFn: (id: number, patch: TPatch) => Promise<T>;
  invalidateKeys: readonly (readonly string[])[];
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
}

export interface UseEntityFormResult<T, TFormValue> {
  isOpen: boolean;
  openEdit: (entity: T, formMapper: (entity: T) => TFormValue) => void;
  closeModal: () => void;
  
  formValue: TFormValue;
  setFormValue: (value: TFormValue) => void;
  currentEntity: T | null;
  
  serverError: string | null;
  setServerError: (error: string | null) => void;
  
  handleSubmit: () => void;
  isSubmitting: boolean;
}


export function useEntityForm<T extends { id: number }, TFormValue, TPatch>({
  initialFormValue,
  toPatch,
  updateFn,
  invalidateKeys,
  successMessage = "Entity updated successfully!",
  errorMessage = "Could not update entity",
  onSuccess,
}: UseEntityFormOptions<T, TFormValue, TPatch>): UseEntityFormResult<T, TFormValue> {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [currentEntity, setCurrentEntity] = useState<T | null>(null);
  const [formValue, setFormValue] = useState<TFormValue>(initialFormValue);
  const [serverError, setServerError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; patch: TPatch }) =>
      updateFn(input.id, input.patch),
    onSuccess: () => {
      setIsOpen(false);
      setCurrentEntity(null);
      setServerError(null);
      setFormValue(initialFormValue);
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      toast.showSuccess(successMessage);
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : errorMessage;
      setServerError(message);
      toast.showError(message);
    },
  });

  const openEdit = useCallback(
    (entity: T, formMapper: (entity: T) => TFormValue) => {
      setCurrentEntity(entity);
      setFormValue(formMapper(entity));
      setServerError(null);
      setIsOpen(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    if (updateMutation.isPending) {
      return;
    }
    setIsOpen(false);
    setCurrentEntity(null);
    setServerError(null);
    setFormValue(initialFormValue);
  }, [updateMutation.isPending, initialFormValue]);

  const handleSubmit = useCallback(() => {
    if (!currentEntity) {
      return;
    }
    const patch = toPatch(currentEntity, formValue);
    if (Object.keys(patch as object).length === 0) {
      setServerError("No changes detected");
      return;
    }
    updateMutation.mutate({ id: currentEntity.id, patch });
  }, [currentEntity, formValue, toPatch, updateMutation]);

  return {
    isOpen,
    openEdit,
    closeModal,
    formValue,
    setFormValue,
    currentEntity,
    serverError,
    setServerError,
    handleSubmit,
    isSubmitting: updateMutation.isPending,
  };
}
