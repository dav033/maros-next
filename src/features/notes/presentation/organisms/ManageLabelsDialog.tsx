"use client";

import { useMemo, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useInstantNoteTags } from "../hooks/data/useInstantNoteTags";
import { useInstantNoteTree } from "../hooks/data/useInstantNoteTree";
import { useNoteTagMutations } from "../hooks/mutations/useNoteTagMutations";
import { NOTE_TAG_COLOR_KEYS, noteTagColor } from "../atoms/noteVisualTokens";
import type { NoteTag } from "@/notes/domain";

function ColorSwatchPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {NOTE_TAG_COLOR_KEYS.map((color) => (
        <button
          key={color}
          type="button"
          title={color}
          onClick={() => onChange(color)}
          className={cn(
            "h-4 w-4 shrink-0 rounded-full ring-offset-2 ring-offset-background transition-all",
            value === color && "ring-2 ring-ring"
          )}
          style={{ backgroundColor: noteTagColor(color) }}
        />
      ))}
    </div>
  );
}

function TagRow({ tag, noteCount }: { tag: NoteTag; noteCount: number }) {
  const { updateTagMutation, deleteTagMutation } = useNoteTagMutations();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);

  const startEditing = () => {
    setName(tag.name);
    setColor(tag.color);
    setIsEditing(true);
  };

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await updateTagMutation.mutateAsync({ id: tag.id, patch: { name: trimmed, color } });
      setIsEditing(false);
    } catch {
      // handled by useEntityMutation's onError
    }
  };

  const remove = async () => {
    const confirmed = window.confirm(
      `Delete label "${tag.name}"? It will be removed from ${noteCount} note${noteCount === 1 ? "" : "s"}.`
    );
    if (!confirmed) return;
    try {
      await deleteTagMutation.mutateAsync(tag.id);
    } catch {
      // handled by onError
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void save();
            }
            if (e.key === "Escape") setIsEditing(false);
          }}
          className="h-8 flex-1 text-sm"
          autoFocus
        />
        <ColorSwatchPicker value={color} onChange={setColor} />
        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={save}>
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0"
          onClick={() => setIsEditing(false)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/50">
      <span
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: noteTagColor(tag.color) }}
      />
      <span className="flex-1 truncate text-sm font-medium">{tag.name}</span>
      <span className="text-xs text-muted-foreground">
        {noteCount} note{noteCount === 1 ? "" : "s"}
      </span>
      <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={startEditing}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 shrink-0 hover:bg-destructive/15 hover:text-destructive"
        onClick={remove}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function ManageLabelsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { tags } = useInstantNoteTags();
  const { pages } = useInstantNoteTree();
  const { createTagMutation } = useNoteTagMutations();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(NOTE_TAG_COLOR_KEYS[0]);

  const noteCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const page of pages) {
      for (const tag of page.tags) {
        counts.set(tag.id, (counts.get(tag.id) ?? 0) + 1);
      }
    }
    return counts;
  }, [pages]);

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    try {
      await createTagMutation.mutateAsync({ name: trimmed, color: newColor });
      setNewName("");
      setNewColor(NOTE_TAG_COLOR_KEYS[0]);
    } catch {
      // handled by onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Labels</DialogTitle>
          <DialogDescription>
            Reusable labels to organize notes across your workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
          {tags.length === 0 && (
            <p className="px-2 py-4 text-sm text-muted-foreground">No labels yet.</p>
          )}
          {tags.map((tag) => (
            <TagRow key={tag.id} tag={tag} noteCount={noteCounts.get(tag.id) ?? 0} />
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground/80">
            New label
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleCreate();
                }
              }}
              placeholder="Label name…"
              className="h-9 flex-1 text-sm"
            />
            <ColorSwatchPicker value={newColor} onChange={setNewColor} />
            <Button size="sm" className="shrink-0 gap-1.5" onClick={handleCreate}>
              <Plus className="h-3.5 w-3.5" />
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
