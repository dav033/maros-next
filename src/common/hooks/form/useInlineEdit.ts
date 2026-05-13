"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface UseInlineEditOptions<T extends object> {
  /** The current persisted data to edit */
  initialData: T;
  /** Async function to persist the patch. Should throw on failure. */
  onSave: (patch: Partial<T>) => Promise<void>;
  /** Fields to include in the diff. If omitted, all fields in editingValue are diffed. */
  fields?: (keyof T)[];
  /** Success toast message. Defaults to "Saved successfully!" */
  successMessage?: string;
  /** Error toast message. Defaults to error.message or "Failed to save" */
  errorMessage?: string;
  /** Called after a successful save */
  onSuccess?: () => void;
}

export interface UseInlineEditReturn<T extends object> {
  /** Whether the user is currently editing */
  isEditing: boolean;
  /** The editing form value (only valid during editing) */
  editingValue: Partial<T>;
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** Enter edit mode, populating editingValue from initialData */
  startEdit: () => void;
  /** Cancel editing and discard changes */
  cancelEdit: () => void;
  /** Persist the changes (calls onSave with the diff) */
  saveEdit: () => Promise<void>;
  /** Update a single field in the editing form */
  setField: <K extends keyof T>(field: K, value: T[K]) => void;
  /** Batch update multiple fields */
  setFields: (updates: Partial<T>) => void;
}

/**
 * Generic hook for inline editing of an entity.
 * Handles edit mode toggling, form state, diff calculation, and save with toast feedback.
 *
 * Replaces the manual pattern of:
 * - `isEditing` + `editingValue` state
 * - `handleStartEditing` + `handleCancelEditing` callbacks
 * - `handleSave` with field-by-field diff and try/catch/toast
 *
 * Used across LeadDetailsPage, ContactDetailsPage, and CompanyDetailsPage.
 */
export function useInlineEdit<T extends object>({
  initialData,
  onSave,
  fields,
  successMessage = "Saved successfully!",
  errorMessage,
  onSuccess,
}: UseInlineEditOptions<T>): UseInlineEditReturn<T> {
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState<Partial<T>>({});
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = useCallback(() => {
    // Seed editing state from initialData
    const seed: Partial<T> = {};
    if (fields) {
      for (const key of fields) {
        seed[key] = initialData[key];
      }
    } else {
      Object.assign(seed, initialData);
    }
    setEditingValue(seed);
    setIsEditing(true);
  }, [initialData, fields]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditingValue({});
  }, []);

  const setField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setEditingValue((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const setFields = useCallback((updates: Partial<T>) => {
    setEditingValue((prev) => ({ ...prev, ...updates }));
  }, []);

  const saveEdit = useCallback(async () => {
    setIsSaving(true);
    try {
      // Build patch: only include fields that actually changed
      const patch: Partial<T> = {};
      const keysToCheck = fields ?? (Object.keys(editingValue) as (keyof T)[]);

      for (const key of keysToCheck) {
        const editedVal = editingValue[key];
        const originalVal = initialData[key];

        if (editedVal !== undefined && editedVal !== originalVal) {
          // Trim strings automatically
          patch[key] =
            typeof editedVal === "string"
              ? ((editedVal.trim() || null) as T[keyof T])
              : editedVal;
        }
      }

      if (Object.keys(patch).length > 0) {
        await onSave(patch);
      }

      setIsEditing(false);
      toast.success(successMessage);
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        errorMessage ??
        (err instanceof Error ? err.message : "Failed to save");
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }, [
    editingValue,
    initialData,
    fields,
    onSave,
    successMessage,
    errorMessage,
    onSuccess,
  ]);

  return {
    isEditing,
    editingValue,
    isSaving,
    startEdit,
    cancelEdit,
    saveEdit,
    setField,
    setFields,
  };
}
