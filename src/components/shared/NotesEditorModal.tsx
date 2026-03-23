"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Loader, Save } from "lucide-react";

export interface NotesEditorModalController {
  isOpen: boolean;
  title: string;
  notes: string[];
  onChangeNotes: (notes: string[]) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
  loading: boolean;
}

interface NotesEditorModalProps {
  controller: NotesEditorModalController;
}

export function NotesEditorModal({ controller }: NotesEditorModalProps) {
  const { isOpen, title, notes, onChangeNotes, onClose, onSave, loading } =
    controller;

  const handleAddNote = () => {
    onChangeNotes([...notes, ""]);
  };

  const handleUpdateNote = (index: number, value: string) => {
    const updated = [...notes];
    updated[index] = value;
    onChangeNotes(updated);
  };

  const handleRemoveNote = (index: number) => {
    const updated = notes.filter((_, i) => i !== index);
    onChangeNotes(updated);
  };

  const handleSave = async () => {
    await onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {notes.length === 0
              ? "No notes yet"
              : `${notes.length} note${notes.length === 1 ? "" : "s"}`}
          </p>
          <Button variant="outline" size="sm" onClick={handleAddNote}>
            <Plus className="size-3.5 mr-1" />
            Add Note
          </Button>
        </div>

        {notes.length > 0 && (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {notes.map((note, index) => (
              <div
                key={index}
                className="group relative rounded-lg border border-border bg-card p-1"
              >
                <Textarea
                  value={note}
                  onChange={(e) => handleUpdateNote(index, e.target.value)}
                  placeholder={`Note ${index + 1}...`}
                  rows={3}
                  className="resize-none border-0 focus-visible:ring-0"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveNote(index)}
                  className="absolute right-2 top-2 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label="Remove note"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        </div>
        <DialogFooter>
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Save Notes
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
