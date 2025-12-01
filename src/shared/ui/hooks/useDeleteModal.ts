"use client";

import { useState, useCallback } from "react";

export type DeleteModalState<T> = {
  isOpen: boolean;
  item: T | null;
  isLoading: boolean;
  error: string | null;
};

export type UseDeleteModalResult<T> = {
  deleteModalState: DeleteModalState<T>;
  openDeleteModal: (item: T) => void;
  closeDeleteModal: () => void;
  confirmDelete: (onDeleteFn: (item: T) => Promise<void>) => Promise<void>;
  setDeleteError: (error: string | null) => void;
};

export function useDeleteModal<T>(): UseDeleteModalResult<T> {
  const [deleteModalState, setDeleteModalState] = useState<DeleteModalState<T>>({
    isOpen: false,
    item: null,
    isLoading: false,
    error: null,
  });

  const openDeleteModal = useCallback((item: T) => {
    setDeleteModalState({
      isOpen: true,
      item,
      isLoading: false,
      error: null,
    });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalState({
      isOpen: false,
      item: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const setDeleteError = useCallback((error: string | null) => {
    setDeleteModalState((prev) => ({ ...prev, error }));
  }, []);

  const confirmDelete = useCallback(
    async (onDeleteFn: (item: T) => Promise<void>) => {
      if (!deleteModalState.item) return;

      setDeleteModalState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await onDeleteFn(deleteModalState.item);
        closeDeleteModal();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to delete item";
        setDeleteModalState((prev) => ({ ...prev, error: message }));
        throw error;
      } finally {
        setDeleteModalState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [deleteModalState.item, closeDeleteModal]
  );

  return {
    deleteModalState,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    setDeleteError,
  };
}
