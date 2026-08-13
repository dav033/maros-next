"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { cn } from "@/lib/utils";
import type { DirectoryUser } from "@/features/users/domain";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";

export interface TaskMentionMenuListProps {
  items: DirectoryUser[];
  command: (item: DirectoryUser) => void;
}

export interface TaskMentionMenuListHandle {
  onKeyDown: (event: { event: KeyboardEvent }) => boolean;
}

/**
 * Owns arrow/enter/escape handling itself (imperative onKeyDown, exposed via ref to
 * the suggestion plugin) rather than delegating to cmdk — same reasoning
 * NoteSlashMenuList gives: cmdk and the ProseMirror suggestion plugin fighting over
 * arrow keys is the classic slash/mention-menu bug.
 */
export const TaskMentionMenuList = forwardRef<TaskMentionMenuListHandle, TaskMentionMenuListProps>(
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
          No matches
        </div>
      );
    }

    return (
      <div className="w-64 max-h-64 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
        {items.map((user, index) => (
          <button
            key={user.id}
            type="button"
            onClick={() => selectItem(index)}
            className={cn(
              "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
              index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
            )}
          >
            <AssigneeAvatar person={user} />
            <div className="min-w-0">
              <div className="truncate">{user.name ?? user.email}</div>
              {user.name && <div className="truncate text-xs text-muted-foreground">{user.email}</div>}
            </div>
          </button>
        ))}
      </div>
    );
  }
);

TaskMentionMenuList.displayName = "TaskMentionMenuList";
