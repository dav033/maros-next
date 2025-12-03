"use client";

import { useCallback } from "react";
import { useCrudState } from "./useCrudState";
import { useCrudMutations } from "./useCrudMutations";
import { useCrudModal } from "./useCrudModal";
import { useCrudForm } from "./useCrudForm";

export type { CrudMode } from "./useCrudState";

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
  mode: ReturnType<typeof useCrudState>["mode"];
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
/**
 * Composite hook that orchestrates CRUD page functionality.
 * 
 * This hook has been refactored into smaller, composable hooks:
 * - useCrudState: Manages state (mode, currentItem, formValue, errors)
 * - useCrudMutations: Handles create/update/delete operations
 * - useCrudModal: Controls modal open/close/mode switching
 * - useCrudForm: Manages form submissions and transformations
 * 
 * Benefits of this architecture:
 * - Each hook has a single responsibility
 * - Easier to test in isolation
 * - Reusable components for custom CRUD implementations
 * - Better type safety and intellisense
 * 
 * @example
 * const crud = useCrudPage({
 *   queryKey: ["contacts"],
 *   createFn: (draft) => api.create(draft),
 *   updateFn: (id, patch) => api.update(id, patch),
 *   toDraft: (form) => ({ ...form }),
 *   toPatch: (current, form) => createPatch(current, form),
 *   initialFormValue: { name: "" },
 *   toFormValue: (entity) => ({ name: entity.name }),
 * });
 */
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

  // 1. State management
  const state = useCrudState<TEntity, TFormValue>({
    initialFormValue,
  });

  // 2. Mutations (create/update)
  const mutations = useCrudMutations<TEntity, TDraft, TPatch>({
    queryKey,
    createFn,
    updateFn,
    successMessages,
    onCreateSuccess: async () => {
      state.resetState();
      await onSuccess?.();
    },
    onUpdateSuccess: async () => {
      state.resetState();
      await onSuccess?.();
    },
  });

  // 3. Modal control
  const modal = useCrudModal<TEntity, TFormValue>({
    mode: state.mode,
    currentItem: state.currentItem,
    initialFormValue,
    toFormValue,
    isPending: mutations.isPending,
    setMode: state.setMode,
    setCurrentItem: state.setCurrentItem,
    setFormValue: state.setFormValue,
    setServerError: state.setServerError,
    resetState: state.resetState,
  });

  // 4. Form handling
  const form = useCrudForm<TEntity, TFormValue, TDraft, TPatch>({
    formValue: state.formValue,
    currentItem: state.currentItem,
    toDraft,
    toPatch,
    setFormValue: state.setFormValue,
    setServerError: state.setServerError,
    handleCreate: mutations.handleCreate,
    handleUpdate: mutations.handleUpdate,
    closeModal: modal.closeModal,
  });

  // Backward compatible handleDelete
  const handleDelete = useCallback((id: number) => {
    mutations.invalidateQueries();
  }, [mutations]);

  // Compose and return the complete API
  return {
    // State
    mode: state.mode,
    currentItem: state.currentItem,
    formValue: form.formValue,
    serverError: state.serverError,
    
    // Mutations status
    isCreating: mutations.isCreating,
    isUpdating: mutations.isUpdating,
    isPending: mutations.isPending,
    
    // Modal actions
    openCreate: modal.openCreate,
    openEdit: modal.openEdit,
    closeModal: modal.closeModal,
    
    // Form actions
    setFormValue: state.setFormValue,
    handleFormChange: form.handleFormChange,
    setServerError: form.setServerError,
    handleCreateSubmit: form.handleCreateSubmit,
    handleEditSubmit: form.handleEditSubmit,
    
    // Delete (legacy support)
    handleDelete,
  };
}
