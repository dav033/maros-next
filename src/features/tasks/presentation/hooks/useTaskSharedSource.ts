"use client";

import { useLayoutEffect, useRef, useState } from "react";

export type TaskSharedSource = {
  taskId: number;
  kind: "card" | "title";
  layoutId?: string;
};

export function findActiveTaskElement<T extends HTMLElement>(selector: string): T | null {
  const focused = document.activeElement?.closest<T>(selector);
  if (focused && !focused.closest("[inert], [aria-hidden='true']")) return focused;
  const candidates = document.querySelectorAll<T>(selector);
  for (const candidate of candidates) {
    if (candidate.closest("[inert], [aria-hidden='true']")) continue;
    return candidate;
  }
  return null;
}

export function useTaskSharedSource(taskId: number | null): TaskSharedSource | null {
  const [source, setSource] = useState<TaskSharedSource | null>(null);
  const previousTaskId = useRef(taskId);

  useLayoutEffect(() => {
    const openedFromClosedState = previousTaskId.current === null && taskId !== null;
    previousTaskId.current = taskId;

    if (!openedFromClosedState) {
      setSource(null);
      return;
    }

    if (findActiveTaskElement(`[data-task-card-id="${taskId}"]`)) {
      setSource({ taskId, kind: "card" });
      return;
    }

    const titleSource = findActiveTaskElement(`[data-task-title-id="${taskId}"]`);
    setSource(titleSource ? { taskId, kind: "title", layoutId: titleSource.dataset.taskTitleLayoutId } : null);
  }, [taskId]);

  return source?.taskId === taskId ? source : null;
}
