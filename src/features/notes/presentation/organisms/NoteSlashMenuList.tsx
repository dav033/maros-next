"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { cn } from "@/lib/utils";
import type { NoteSlashCommandItem } from "@/features/notes/config/noteSlashCommands";

export interface NoteSlashMenuListProps {
  items: NoteSlashCommandItem[];
  command: (item: NoteSlashCommandItem) => void;
}

export interface NoteSlashMenuListHandle {
  onKeyDown: (event: { event: KeyboardEvent }) => boolean;
}

/**
 * Owns arrow/enter/escape handling itself (imperative onKeyDown, exposed to the
 * suggestion plugin via ref) instead of delegating to cmdk's Command component —
 * having both cmdk and the ProseMirror suggestion plugin fight over arrow keys is
 * the classic slash-menu bug, so this list is deliberately not cmdk-based.
 */
export const NoteSlashMenuList = forwardRef<NoteSlashMenuListHandle, NoteSlashMenuListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => setSelectedIndex(0), [items]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) command(item);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowDown") {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }
        if (event.key === "ArrowUp") {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="w-64 rounded-md border border-border bg-popover p-2 text-sm text-muted-foreground shadow-md">
          No results
        </div>
      );
    }

    return (
      <div className="w-64 max-h-80 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectItem(index)}
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex flex-col">
                <span>{item.title}</span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }
);

NoteSlashMenuList.displayName = "NoteSlashMenuList";
