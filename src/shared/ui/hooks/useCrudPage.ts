"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../context/ToastContext";

export type CrudMode = "list" | "create" | "edit";

export type UseCrudPageOptions<TEntity, TFormValue, TDraft, TPatch> = {
  queryKey: unknown[] | unknown[][];
  createFn: (draft: TDraft) => Promise<TEntity>;
  updateFn: (id: number, patch: TPatch) => Promise<TEntity>;
  toDraft: (formValue: TFormValue) => TDraft;
  toPatch: (current: TEntity, formValue: TFormValue) => TPatch;
  initialFormValue: TFormValue;
  toFormValue: (entity: TEntity) => TFormValue;
  successMessages?: {
    create?: string;
    update?: string;
  };
  onSuccess?: () => void | Promise<void>;
};

export type UseCrudPageResult<TEntity, TFormValue> = {
  mode: CrudMode;
  currentItem: TEntity | null;
  formValue: TFormValue;
  serverError: string | null;
  
  isCreating: boolean;
  isUpdating: boolean;
  isPending: boolean;
  
  openCreate: () => void;
  openEdit: (item: TEntity) => void;
  closeModal: () => void;
  
  setFormValue: (value: TFormValue) => void;
  handleFormChange: (value: TFormValue) => void;
  setServerError: (error: string | null) => void;
  
  handleCreateSubmit: () => void;
  handleEditSubmit: () => void;
  
  handleDelete: (id: number) => void;
};

export function useCrudPage<TEntity extends { id: number }, TFormValue, TDraft, TPatch>(
  options: UseCrudPageOptions<TEntity, TFormValue, TDraft, TPatch>
): UseCrudPageResult<TEntity, TFormValue> {
  const {
    queryKey,
    createFn,
    updateFn,
    toDraft,
    toPatch,
    initialFormValue,
    toFormValue,
    successMessages,
    onSuccess,
  } = options;

  const queryClient = useQueryClient();
  const toast = useToast();

  const [mode, setMode] = useState<CrudMode>("list");
  const [currentItem, setCurrentItem] = useState<TEntity | null>(null);
  const [formValue, setFormValue] = useState<TFormValue>(initialFormValue);
  const [serverError, setServerError] = useState<string | null>(null);

  const invalidateQueries = () => {
    if (Array.isArray(queryKey[0])) {
      (queryKey as unknown[][]).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    } else {
      queryClient.invalidateQueries({ queryKey: queryKey as unknown[] });
    }
  };

  const createMutation = useMutation({
    mutationFn: createFn,
    onSuccess: async () => {
      setMode("list");
      setCurrentItem(null);
      setServerError(null);
      setFormValue(initialFormValue);
      invalidateQueries();
      toast.showSuccess(successMessages?.create ?? "Created successfully!");
      await onSuccess?.();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Could not create";
      setServerError(message);
      toast.showError(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: TPatch }) => updateFn(id, patch),
    onSuccess: async () => {
      setMode("list");
      setCurrentItem(null);
      setServerError(null);
      setFormValue(initialFormValue);
      invalidateQueries();
      toast.showSuccess(successMessages?.update ?? "Updated successfully!");
      await onSuccess?.();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Could not update";
      setServerError(message);
      toast.showError(message);
    },
  });

  const openCreate = useCallback(() => {
    setFormValue(initialFormValue);
    setCurrentItem(null);
    setServerError(null);
    setMode("create");
  }, [initialFormValue]);

  const openEdit = useCallback((item: TEntity) => {
    setCurrentItem(item);
    setFormValue(toFormValue(item));
    setServerError(null);
    setMode("edit");
  }, [toFormValue]);

  const closeModal = useCallback(() => {
    if (createMutation.isPending || updateMutation.isPending) {
      return;
    }
    setMode("list");
    setCurrentItem(null);
    setServerError(null);
    setFormValue(initialFormValue);
  }, [createMutation.isPending, updateMutation.isPending, initialFormValue]);

  const handleFormChange = useCallback((value: TFormValue) => {
    setFormValue(value);
  }, []);

  const handleCreateSubmit = useCallback(() => {
    const draft = toDraft(formValue);
    createMutation.mutate(draft);
  }, [formValue, toDraft, createMutation]);

  const handleEditSubmit = useCallback(() => {
    if (!currentItem) {
      return;
    }
    const patch = toPatch(currentItem, formValue);
    if (Object.keys(patch as object).length === 0) {
      closeModal();
      return;
    }
    updateMutation.mutate({ id: currentItem.id, patch });
  }, [currentItem, formValue, toPatch, updateMutation, closeModal]);

  const handleDelete = useCallback((id: number) => {
    invalidateQueries();
  }, []);

  return {
    mode,
    currentItem,
    formValue,
    serverError,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isPending: createMutation.isPending || updateMutation.isPending,
    
    openCreate,
    openEdit,
    closeModal,
    setFormValue,
    handleFormChange,
    setServerError,
    handleCreateSubmit,
    handleEditSubmit,
    handleDelete,
  };
}
