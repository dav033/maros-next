"use client";

import { useState } from "react";
import { Tag as TagIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useInstantNoteTags } from "../hooks/data/useInstantNoteTags";
import { useNoteTagMutations } from "../hooks/mutations/useNoteTagMutations";
import { noteTagColor } from "../atoms/noteVisualTokens";
import type { NoteTag } from "@/notes/domain";

export function TagPicker({
  selectedTagIds,
  onChange,
}: {
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
}) {
  const { tags } = useInstantNoteTags();
  const { createTagMutation } = useNoteTagMutations();
  const [newTagName, setNewTagName] = useState("");

  const toggle = (tag: NoteTag) => {
    const isSelected = selectedTagIds.includes(tag.id);
    onChange(
      isSelected
        ? selectedTagIds.filter((id) => id !== tag.id)
        : [...selectedTagIds, tag.id]
    );
  };

  const handleCreate = async () => {
    const name = newTagName.trim();
    if (!name) return;
    const tag = await createTagMutation.mutateAsync({ name });
    setNewTagName("");
    onChange([...selectedTagIds, tag.id]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" title="Tags">
          <TagIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <div className="space-y-1">
          {tags.length === 0 && (
            <p className="px-1 py-2 text-sm text-muted-foreground">No tags yet.</p>
          )}
          {tags.map((tag) => (
            <label
              key={tag.id}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1.5 text-sm hover:bg-accent/50"
            >
              <Checkbox
                checked={selectedTagIds.includes(tag.id)}
                onCheckedChange={() => toggle(tag)}
              />
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: noteTagColor(tag.color) }}
              />
              <span className="truncate">{tag.name}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1 border-t border-border pt-2">
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleCreate();
              }
            }}
            placeholder="New tag…"
            className="h-8 text-sm"
          />
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
