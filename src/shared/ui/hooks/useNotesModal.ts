"use client";
import { useState, useCallback } from "react";
export type NotesModalState<T> = {
  isOpen: boolean;
  item: T | null;
  title: string;
  notes: string[];
  isLoading: boolean;
};
export type UseNotesModalResult<T> = {
  notesModalState: NotesModalState<T>;
  openNotesModal: (item: T, title: string, notes: string[]) => void;
  closeNotesModal: () => void;
  updateNotes: (notes: string[]) => void;
  saveNotes: (onSaveFn: (item: T, notes: string[]) => Promise<void>) => Promise<void>;
};
export function useNotesModal<T>(): UseNotesModalResult<T> {
  const [notesModalState, setNotesModalState] = useState<NotesModalState<T>>({
    isOpen: false,
    item: null,
    title: "",
    notes: [],
    isLoading: false,
  });
  const openNotesModal = useCallback((item: T, title: string, notes: string[]) => {
    setNotesModalState({
      isOpen: true,
      item,
      title,
      notes: Array.isArray(notes) ? notes : [],
      isLoading: false,
    });
  }, []);
  const closeNotesModal = useCallback(() => {
    setNotesModalState((prev) => {
      if (prev.isLoading) return prev;
      return {
        isOpen: false,
        item: null,
        title: "",
        notes: [],
        isLoading: false,
      };
    });
  }, []);
  const updateNotes = useCallback((notes: string[]) => {
    setNotesModalState((prev) => ({ ...prev, notes }));
  }, []);
  const saveNotes = useCallback(
    async (onSaveFn: (item: T, notes: string[]) => Promise<void>) => {
      if (!notesModalState.item) {
        closeNotesModal();
        return;
      }
      setNotesModalState((prev) => ({ ...prev, isLoading: true }));
      try {
        await onSaveFn(notesModalState.item, notesModalState.notes);
        closeNotesModal();
      } catch (error: unknown) {
        console.error("Error saving notes:", error);
        throw error;
      } finally {
        setNotesModalState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [notesModalState.item, notesModalState.notes, closeNotesModal]
  );
  return {
    notesModalState,
    openNotesModal,
    closeNotesModal,
    updateNotes,
    saveNotes,
  };
}
