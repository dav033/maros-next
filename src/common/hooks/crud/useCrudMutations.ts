"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UseCrudMutationsOptions<TEntity, TDraft, TPatch> {
  queryKey: unknown[] | unknown[][];
  createFn: (draft: TDraft) => Promise<TEntity>;
  updateFn: (id: number, patch: TPatch) => Promise<TEntity>;
  successMessages?: {
    create?: string;
    update?: string;
  };
  onCreateSuccess?: (entity: TEntity) => void | Promise<void>;
  onUpdateSuccess?: (entity: TEntity) => void | Promise<void>;
  // Optional notification callbacks (for flexibility across projects)
  onSuccessNotification?: (message: string) => void;
  onErrorNotification?: (message: string) => void;
}

export interface UseCrudMutationsReturn<TEntity, TDraft, TPatch> {
  // Create mutation
  createMutation: ReturnType<typeof useMutation<TEntity, Error, TDraft>>;
  handleCreate: (draft: TDraft) => void;
  isCreating: boolean;
  
  // Update mutation
  updateMutation: ReturnType<typeof useMutation<TEntity, Error, { id: number; patch: TPatch }>>;
  handleUpdate: (id: number, patch: TPatch) => void;
  isUpdating: boolean;
  
  // Combined state
  isPending: boolean;
  
  // Utilities
  invalidateQueries: () => void;
}

/**
 * Hook for managing CRUD mutations (create, update, delete).
 * Handles React Query mutations, query invalidation, and success/error notifications.
 * 
 * Separated from state management for better testing and composition.
 * 
 * Notifications are optional - projects can provide their own toast/notification system.
 */
export function useCrudMutations<TEntity extends { id: number }, TDraft, TPatch>({
  queryKey,
  createFn,
  updateFn,
  successMessages,
  onCreateSuccess,
  onUpdateSuccess,
  onSuccessNotification,
  onErrorNotification,
}: UseCrudMutationsOptions<TEntity, TDraft, TPatch>): UseCrudMutationsReturn<TEntity, TDraft, TPatch> {
  const queryClient = useQueryClient();

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
    onSuccess: async (entity) => {
      invalidateQueries();
      const message = successMessages?.create ?? "Created successfully!";
      onSuccessNotification?.(message);
      await onCreateSuccess?.(entity);
    },
    onError: (error: Error) => {
      const message = error.message || "Could not create";
      onErrorNotification?.(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: TPatch }) => updateFn(id, patch),
    onSuccess: async (entity) => {
      invalidateQueries();
      const message = successMessages?.update ?? "Updated successfully!";
      onSuccessNotification?.(message);
      await onUpdateSuccess?.(entity);
    },
    onError: (error: Error) => {
      const message = error.message || "Could not update";
      onErrorNotification?.(message);
    },
  });

  const handleCreate = (draft: TDraft) => {
    createMutation.mutate(draft);
  };

  const handleUpdate = (id: number, patch: TPatch) => {
    updateMutation.mutate({ id, patch });
  };

  return {
    createMutation,
    handleCreate,
    isCreating: createMutation.isPending,
    updateMutation,
    handleUpdate,
    isUpdating: updateMutation.isPending,
    isPending: createMutation.isPending || updateMutation.isPending,
    invalidateQueries,
  };
}
