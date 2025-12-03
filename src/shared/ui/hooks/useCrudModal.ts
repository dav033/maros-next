"use client";

import { useCallback } from "react";
import type { CrudMode } from "./useCrudState";

export interface UseCrudModalOptions<TEntity, TFormValue> {
  mode: CrudMode;
  currentItem: TEntity | null;
  initialFormValue: TFormValue;
  toFormValue: (entity: TEntity) => TFormValue;
  isPending: boolean;
  
  // State setters from useCrudState
  setMode: (mode: CrudMode) => void;
  setCurrentItem: (item: TEntity | null) => void;
  setFormValue: (value: TFormValue) => void;
  setServerError: (error: string | null) => void;
  resetState: () => void;
}

export interface UseCrudModalReturn<TEntity> {
  openCreate: () => void;
  openEdit: (item: TEntity) => void;
  closeModal: () => void;
  isModalOpen: boolean;
}

/**
 * Hook for managing CRUD modal state and transitions.
 * Handles opening/closing modals and switching between create/edit modes.
 * 
 * Coordinates with useCrudState to manage the overall modal flow.
 */
export function useCrudModal<TEntity extends { id: number }, TFormValue>({
  mode,
  currentItem,
  initialFormValue,
  toFormValue,
  isPending,
  setMode,
  setCurrentItem,
  setFormValue,
  setServerError,
  resetState,
}: UseCrudModalOptions<TEntity, TFormValue>): UseCrudModalReturn<TEntity> {
  
  const openCreate = useCallback(() => {
    setFormValue(initialFormValue);
    setCurrentItem(null);
    setServerError(null);
    setMode("create");
  }, [initialFormValue, setFormValue, setCurrentItem, setServerError, setMode]);

  const openEdit = useCallback((item: TEntity) => {
    setCurrentItem(item);
    setFormValue(toFormValue(item));
    setServerError(null);
    setMode("edit");
  }, [toFormValue, setCurrentItem, setFormValue, setServerError, setMode]);

  const closeModal = useCallback(() => {
    if (isPending) {
      return;
    }
    resetState();
  }, [isPending, resetState]);

  const isModalOpen = mode === "create" || mode === "edit";

  return {
    openCreate,
    openEdit,
    closeModal,
    isModalOpen,
  };
}
