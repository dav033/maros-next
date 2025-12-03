"use client";

import { useState, useCallback, useEffect } from "react";

export interface UseNotesEditorOptions {
  notes: string[];
  onNotesChange: (notes: string[]) => void;
  resetOnClose?: boolean;
}

export interface UseNotesEditorReturn {
  // New note state
  newNote: string;
  setNewNote: (value: string) => void;
  
  // Edit state
  editIndex: number | null;
  editValue: string;
  setEditValue: (value: string) => void;
  
  // Actions
  handleAddNote: () => void;
  handleStartEditNote: (index: number) => void;
  handleSaveEditNote: () => void;
  handleCancelEdit: () => void;
  handleDeleteNoteAtIndex: (index: number) => void;
  
  // Reset
  reset: () => void;
}

/**
 * Custom hook for managing notes editor state and logic.
 * Extracts reusable logic for adding, editing, and deleting notes.
 * 
 * @example
 * const notesEditor = useNotesEditor({
 *   notes: myNotes,
 *   onNotesChange: setMyNotes,
 * });
 */
export function useNotesEditor({
  notes,
  onNotesChange,
  resetOnClose = true,
}: UseNotesEditorOptions): UseNotesEditorReturn {
  const [newNote, setNewNote] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const reset = useCallback(() => {
    setNewNote("");
    setEditIndex(null);
    setEditValue("");
  }, []);

  useEffect(() => {
    if (resetOnClose) {
      // Optional: auto-reset when needed
    }
  }, [resetOnClose]);

  const handleAddNote = useCallback(() => {
    const value = newNote.trim();
    if (!value) return;
    
    const updated = [...notes, value];
    onNotesChange(updated);
    setNewNote("");
  }, [newNote, notes, onNotesChange]);

  const handleStartEditNote = useCallback(
    (index: number) => {
      if (index < 0 || index >= notes.length) return;
      setEditIndex(index);
      setEditValue(notes[index] ?? "");
    },
    [notes]
  );

  const handleSaveEditNote = useCallback(() => {
    if (editIndex === null) return;
    const value = editValue.trim();
    if (!value) return;
    
    const updated = [...notes];
    updated[editIndex] = value;
    onNotesChange(updated);
    setEditIndex(null);
    setEditValue("");
  }, [editIndex, editValue, notes, onNotesChange]);

  const handleCancelEdit = useCallback(() => {
    setEditIndex(null);
    setEditValue("");
  }, []);

  const handleDeleteNoteAtIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= notes.length) return;
      const updated = notes.filter((_, i) => i !== index);
      onNotesChange(updated);
    },
    [notes, onNotesChange]
  );

  return {
    newNote,
    setNewNote,
    editIndex,
    editValue,
    setEditValue,
    handleAddNote,
    handleStartEditNote,
    handleSaveEditNote,
    handleCancelEdit,
    handleDeleteNoteAtIndex,
    reset,
  };
}
