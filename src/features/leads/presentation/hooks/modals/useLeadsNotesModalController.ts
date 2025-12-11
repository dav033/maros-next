"use client";

import { useMemo } from "react";

export interface UseLeadsNotesModalControllerOptions {
  isOpen: boolean;
  title: string;
  notes: string[];
  onChangeNotes: (notes: string[]) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
  loading: boolean;
}

export function useLeadsNotesModalController({
  isOpen,
  title,
  notes,
  onChangeNotes,
  onClose,
  onSave,
  loading,
}: UseLeadsNotesModalControllerOptions) {
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

