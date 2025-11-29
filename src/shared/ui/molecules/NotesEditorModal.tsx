"use client";

import * as React from "react";
import { Modal } from "@/shared/ui";
import { Spinner } from "@/shared/ui/atoms/Spinner";
import { Icon } from "@/shared/ui";

export interface NotesEditorModalProps {
  isOpen: boolean;
  title?: string;
  notes: string[];
  loading?: boolean;
  onChangeNotes: (notes: string[]) => void;
  onClose: () => void;
  onSave: () => void;
}

export function NotesEditorModal({
  isOpen,
  title = "Notes",
  notes,
  loading = false,
  onChangeNotes,
  onClose,
  onSave,
}: NotesEditorModalProps) {
  const [newNote, setNewNote] = React.useState("");
  const [editIndex, setEditIndex] = React.useState<number | null>(null);
  const [editValue, setEditValue] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) {
      setNewNote("");
      setEditIndex(null);
      setEditValue("");
    }
  }, [isOpen]);

  const handleAddNote = React.useCallback(() => {
    const value = newNote.trim();
    if (!value) return;
    const updated = [...notes, value];
    onChangeNotes(updated);
    setNewNote("");
  }, [newNote, notes, onChangeNotes]);

  const handleStartEditNote = React.useCallback(
    (index: number) => {
      if (index < 0 || index >= notes.length) return;
      setEditIndex(index);
      setEditValue(notes[index] ?? "");
    },
    [notes]
  );

  const handleSaveEditNote = React.useCallback(() => {
    if (editIndex === null) return;
    const value = editValue.trim();
    if (!value) return;
    const updated = [...notes];
    updated[editIndex] = value;
    onChangeNotes(updated);
    setEditIndex(null);
    setEditValue("");
  }, [editIndex, editValue, notes, onChangeNotes]);

  const handleDeleteNoteAtIndex = React.useCallback(
    (index: number) => {
      if (index < 0 || index >= notes.length) return;
      const updated = notes.filter((_, i) => i !== index);
      onChangeNotes(updated);
    },
    [notes, onChangeNotes]
  );

  const handleInternalClose = React.useCallback(() => {
    if (loading) return;
    onClose();
  }, [loading, onClose]);

  const handleInternalSave = React.useCallback(() => {
    if (loading) return;
    onSave();
  }, [loading, onSave]);

  return (
    <Modal isOpen={isOpen} title={title} onClose={handleInternalClose}>
      <div className="p-4 space-y-4">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Spinner />
            <span>Saving notes...</span>
          </div>
        )}
        {notes && notes.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {notes.map((note, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-2 rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
              >
                {editIndex === idx ? (
                  <div className="flex w-full items-center gap-2">
                    <input
                      className="flex-1 rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                    <button
                      type="button"
                      className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500"
                      onClick={handleSaveEditNote}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="rounded bg-gray-800 px-3 py-1 text-xs font-medium text-gray-200 hover:bg-gray-700"
                      onClick={() => {
                        setEditIndex(null);
                        setEditValue("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1">{note}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded bg-gray-800 text-gray-300 hover:bg-blue-600 hover:text-white transition-colors"
                        onClick={() => handleStartEditNote(idx)}
                      >
                        <Icon name="lucide:pencil" size={14} />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded bg-red-900/60 text-red-300 hover:bg-red-600 hover:text-white transition-colors"
                        onClick={() => handleDeleteNoteAtIndex(idx)}
                      >
                        <Icon name="lucide:trash-2" size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400">No notes available.</div>
        )}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            className="flex-1 rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a new note..."
            disabled={loading}
          />
          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            onClick={handleAddNote}
            disabled={loading}
          >
            Add
          </button>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="rounded border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800 disabled:opacity-50"
            onClick={handleInternalClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
            onClick={handleInternalSave}
            disabled={loading}
          >
            Save changes
          </button>
        </div>
      </div>
    </Modal>
  );
}
