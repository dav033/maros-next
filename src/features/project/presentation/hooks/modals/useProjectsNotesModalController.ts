"use client";

import { useMemo } from "react";

export interface UseProjectsNotesModalControllerOptions {
  isOpen: boolean;
  title: string;
  notes: string[];
  onChangeNotes: (notes: string[]) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
  loading: boolean;
}

export function useProjectsNotesModalController({
  isOpen,
  title,
  notes,
  onChangeNotes,
  onClose,
  onSave,
  loading,
}: UseProjectsNotesModalControllerOptions) {
  return useMemo(
    () => ({
      isOpen,
      title,
      notes,
      onChangeNotes,
      onClose,
      onSave,
      loading,
    }),
    [isOpen, title, notes, onChangeNotes, onClose, onSave, loading]
  );
}

