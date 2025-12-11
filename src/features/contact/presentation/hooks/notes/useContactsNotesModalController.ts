"use client";

import { useMemo } from "react";

export interface UseContactsNotesModalControllerOptions {
  isOpen: boolean;
  title: string;
  notes: string[];
  onChangeNotes: (notes: string[]) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
  loading: boolean;
}

export function useContactsNotesModalController({
  isOpen,
  title,
  notes,
  onChangeNotes,
  onClose,
  onSave,
  loading,
}: UseContactsNotesModalControllerOptions) {
  return useMemo(
    () => ({
      isOpen,
      title: `Notes – ${title}`,
      notes,
      loading,
      onChangeNotes,
      onClose,
      onSave,
    }),
    [isOpen, title, notes, loading, onChangeNotes, onClose, onSave]
  );
}

