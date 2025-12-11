"use client";

import { useMemo } from "react";

export interface UseCompanyNotesModalControllerOptions {
  isOpen: boolean;
  title: string;
  notes: string[];
  onChangeNotes: (notes: string[]) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
  loading: boolean;
}

export function useCompanyNotesModalController({
  isOpen,
  title,
  notes,
  onChangeNotes,
  onClose,
  onSave,
  loading,
}: UseCompanyNotesModalControllerOptions) {
  return useMemo(
    () => ({
      isOpen,
      title: `Notes – ${title || ""}`,
      notes,
      loading,
      onChangeNotes,
      onClose,
      onSave,
    }),
    [isOpen, title, notes, loading, onChangeNotes, onClose, onSave]
  );
}

