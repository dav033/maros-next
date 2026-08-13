"use client";

import { useEffect, useState } from "react";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { useTaskDetailRoute } from "../hooks/useTaskDetailRoute";

/** Shared with TaskBoard's and TasksListPageView's search inputs — see the `/` shortcut below. */
export const TASK_SEARCH_INPUT_ID = "task-search-input";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

/**
 * Global `c` (new task) and `/` (focus search) shortcuts for every /tasks route —
 * mounted once in TasksLayout, same spot as useTaskEventsStream. `⌘K` lives inside
 * TaskSearchPalette instead, since it owns its own dialog the same way
 * NoteSearchPalette does for notes.
 */
export function TaskKeyboardShortcuts() {
  const { openTask } = useTaskDetailRoute();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return;
      if (event.key === "c") {
        event.preventDefault();
        setCreateOpen(true);
      } else if (event.key === "/") {
        event.preventDefault();
        document.getElementById(TASK_SEARCH_INPUT_ID)?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={openTask} />;
}
