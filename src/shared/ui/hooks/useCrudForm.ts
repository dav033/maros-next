"use client";

import { useCallback } from "react";

export interface UseCrudFormOptions<TEntity, TFormValue, TDraft, TPatch> {
  formValue: TFormValue;
  currentItem: TEntity | null;
  toDraft: (formValue: TFormValue) => TDraft;
  toPatch: (current: TEntity, formValue: TFormValue) => TPatch;
  
  // From useCrudState
  setFormValue: (value: TFormValue) => void;
  setServerError: (error: string | null) => void;
  
  // From useCrudMutations
  handleCreate: (draft: TDraft) => void;
  handleUpdate: (id: number, patch: TPatch) => void;
  
  // From useCrudModal
  closeModal: () => void;
}

export interface UseCrudFormReturn<TFormValue> {
  formValue: TFormValue;
  handleFormChange: (value: TFormValue) => void;
  handleCreateSubmit: () => void;
  handleEditSubmit: () => void;
  setServerError: (error: string | null) => void;
}

/**
 * Hook for managing CRUD form state and submissions.
 * Handles form value changes and submit logic for create/edit operations.
 * 
 * Coordinates transformations and delegates to mutation hooks.
 */
export function useCrudForm<TEntity extends { id: number }, TFormValue, TDraft, TPatch>({
  formValue,
  currentItem,
  toDraft,
  toPatch,
  setFormValue,
  setServerError,
  handleCreate,
  handleUpdate,
  closeModal,
}: UseCrudFormOptions<TEntity, TFormValue, TDraft, TPatch>): UseCrudFormReturn<TFormValue> {
  
  const handleFormChange = useCallback((value: TFormValue) => {
    setFormValue(value);
  }, [setFormValue]);

  const handleCreateSubmit = useCallback(() => {
    const draft = toDraft(formValue);
    handleCreate(draft);
  }, [formValue, toDraft, handleCreate]);

  const handleEditSubmit = useCallback(() => {
    if (!currentItem) {
      return;
    }
    
    const patch = toPatch(currentItem, formValue);
    
    // If no changes detected, just close the modal
    if (Object.keys(patch as object).length === 0) {
      closeModal();
      return;
    }
    
    handleUpdate(currentItem.id, patch);
  }, [currentItem, formValue, toPatch, handleUpdate, closeModal]);

  return {
    formValue,
    handleFormChange,
    handleCreateSubmit,
    handleEditSubmit,
    setServerError,
  };
}
