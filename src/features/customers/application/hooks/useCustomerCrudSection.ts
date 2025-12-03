"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEntityForm } from "@/shared";
import { useToast } from "@/shared/ui";

export type CustomerCrudSectionConfig<TEntity, TFormValue, TPatch> = {
  initialFormValue: TFormValue;
  toPatch: (current: TEntity, value: TFormValue) => TPatch;
  toFormValue: (entity: TEntity) => TFormValue;
  updateFn: (id: number, patch: TPatch) => Promise<TEntity>;
  deleteFn: (id: number) => Promise<void>;
  invalidateKeys: readonly (readonly string[])[];
  messages?: {
    successUpdate?: string;
    errorUpdate?: string;
    successDelete?: string;
    errorDelete?: string;
  };
};

export type CustomerCrudSectionResult<TEntity, TFormValue> = {
  modal: {
    isOpen: boolean;
    closeModal: () => void;
    formValue: TFormValue;
    setFormValue: (value: TFormValue) => void;
    serverError: string | null;
    isSubmitting: boolean;
  };
  handlers: {
    handleEdit: (entity: TEntity) => void;
    handleSubmit: () => void;
    handleDelete: (id: number) => Promise<void>;
  };
};

export function useCustomerCrudSection<TEntity extends { id: number }, TFormValue, TPatch>(
  config: CustomerCrudSectionConfig<TEntity, TFormValue, TPatch>
): CustomerCrudSectionResult<TEntity, TFormValue> {
  const {
    initialFormValue,
    toPatch,
    toFormValue,
    updateFn,
    deleteFn,
    invalidateKeys,
    messages = {},
  } = config;

  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    successUpdate = "Updated successfully!",
    errorUpdate = "Could not update",
    successDelete = "Deleted successfully!",
    errorDelete = "Could not delete",
  } = messages;

  // Use the existing useEntityForm hook for update logic
  const {
    isOpen,
    openEdit,
    closeModal,
    formValue,
    setFormValue,
    serverError,
    handleSubmit,
    isSubmitting,
  } = useEntityForm({
    initialFormValue,
    toPatch,
    updateFn,
    invalidateKeys,
    successMessage: successUpdate,
    errorMessage: errorUpdate,
  });

  const handleEdit = useCallback(
    (entity: TEntity) => {
      openEdit(entity, toFormValue);
    },
    [openEdit, toFormValue]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteFn(id);
        
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key as any[] });
        });
        
        toast.showSuccess(successDelete);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : errorDelete;
        toast.showError(message);
      }
    },
    [deleteFn, invalidateKeys, queryClient, toast, successDelete, errorDelete]
  );

  return {
    modal: {
      isOpen,
      closeModal,
      formValue,
      setFormValue,
      serverError,
      isSubmitting,
    },
    handlers: {
      handleEdit,
      handleSubmit,
      handleDelete,
    },
  };
}
