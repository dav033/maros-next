"use client";

import { useState, useCallback } from "react";

export type CrudMode = "list" | "create" | "edit";

export interface UseCrudStateOptions<TEntity, TFormValue> {
  initialFormValue: TFormValue;
}

export interface UseCrudStateReturn<TEntity, TFormValue> {
  // State
  mode: CrudMode;
  currentItem: TEntity | null;
  formValue: TFormValue;
  serverError: string | null;
  
  // Setters
  setMode: (mode: CrudMode) => void;
  setCurrentItem: (item: TEntity | null) => void;
  setFormValue: (value: TFormValue) => void;
  setServerError: (error: string | null) => void;
  
  // Actions
  resetState: () => void;
}

/**
 * Hook for managing CRUD page state.
 * Handles mode, current item, form values, and error state.
 * 
 * Separated from logic to improve testability and reusability.
 */
export function useCrudState<TEntity extends { id: number }, TFormValue>({
  initialFormValue,
}: UseCrudStateOptions<TEntity, TFormValue>): UseCrudStateReturn<TEntity, TFormValue> {
  const [mode, setMode] = useState<CrudMode>("list");
  const [currentItem, setCurrentItem] = useState<TEntity | null>(null);
  const [formValue, setFormValue] = useState<TFormValue>(initialFormValue);
  const [serverError, setServerError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setMode("list");
    setCurrentItem(null);
    setFormValue(initialFormValue);
    setServerError(null);
  }, [initialFormValue]);

  return {
    mode,
    currentItem,
    formValue,
    serverError,
    setMode,
    setCurrentItem,
    setFormValue,
    setServerError,
    resetState,
  };
}
