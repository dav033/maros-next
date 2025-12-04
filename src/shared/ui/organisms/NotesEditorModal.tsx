"use client";

import * as React from "react";
import { Modal, Input, Button, ICON_SIZES } from "@/shared/ui";
import { Spinner } from "@/shared/ui/atoms/Spinner";
import { Icon } from "@/shared/ui";
import { useNotesEditor } from "../hooks/useNotesEditor";

export interface NotesEditorModalProps {
  isOpen: boolean;
  title?: string;
  notes: string[];
  loading?: boolean;
  fullWidth?: boolean;
  onChangeNotes: (notes: string[]) => void;
  onClose: () => void;
  onSave: () => void;
}

export function NotesEditorModal({
  isOpen,
  title = "Notes",
  notes,
  loading = false,
  fullWidth = false,
  onChangeNotes,
  onClose,
  onSave,
}: NotesEditorModalProps) {
  const editor = useNotesEditor({
    notes,
    onNotesChange: onChangeNotes,
  });

  React.useEffect(() => {
    if (!isOpen) {
      editor.reset();
    }
  }, [isOpen, editor.reset]);

  const handleInternalClose = React.useCallback(() => {
    if (loading) return;
    onClose();
  }, [loading, onClose]);

  const handleInternalSave = React.useCallback(() => {
    if (loading) return;
    onSave();
  }, [loading, onSave]);

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={handleInternalClose}
      fullWidth={fullWidth}
    >
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
                className="flex items-center justify-between gap-2 rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
              >
                {editor.editIndex === idx ? (
                  <div className="flex w-full items-center gap-2">
                    <div className="flex-1">
                      <Input
                        value={editor.editValue}
                        onChange={(e) => editor.setEditValue(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={editor.handleSaveEditNote}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={editor.handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1">{note}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.handleStartEditNote(idx)}
                        className="h-7 w-7 p-0 min-h-0 bg-gray-800 hover:bg-blue-600 hover:text-white"
                      >
                        <Icon name="lucide:pencil" size={ICON_SIZES.xs} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.handleDeleteNoteAtIndex(idx)}
                        className="h-7 w-7 p-0 min-h-0 bg-red-900/60 text-red-300 hover:bg-red-600 hover:text-white"
                      >
                        <Icon name="lucide:trash-2" size={ICON_SIZES.xs} />
                      </Button>
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
          <div className="flex-1">
            <Input
              type="text"
              value={editor.newNote}
              onChange={(e) => editor.setNewNote(e.target.value)}
              placeholder="Add a new note..."
              disabled={loading}
            />
          </div>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={editor.handleAddNote}
            disabled={loading}
          >
            Add
          </Button>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleInternalClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleInternalSave}
            disabled={loading}
            className="bg-green-600 hover:bg-green-500"
          >
            Save changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
