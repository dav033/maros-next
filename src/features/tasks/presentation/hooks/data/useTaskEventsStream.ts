"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getTask, tasksKeys } from "@/tasks/application";
import { useTasksApp } from "@/di";
import type { Task, TaskBoardResult, TaskDetail, TaskFilters, TaskListResult } from "@/tasks/domain";
import { parseTaskChangedPayload } from "./taskChangedPayload";

// Same fallback/override convention as OptimizedApiClient — EventSource needs an
// absolute URL, unlike axios, which carries its own configured baseURL. Not built
// from the infra layer's `endpoints` map on purpose: SSE isn't a request/response
// call through TasksRepositoryPort, so it doesn't belong to that abstraction.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.marosconstruction.com/api";
const STREAM_URL = `${API_BASE_URL}/tasks/events/stream`;

/**
 * Keeps the board/list/mine views live: subscribes to the backend's `task.changed`
 * SSE stream (see TasksController.streamEvents) and invalidates whatever this task
 * could be showing up in, whenever *someone else* changes it — the stream is already
 * filtered server-side to exclude the current user's own edits (their own mutation's
 * onSuccess already refreshed their view, scoped precisely — see
 * taskInvalidationScope).
 *
 * A remote change's exact scope isn't known client-side (the event only carries
 * taskId/actorId, not which fields changed — see TaskEventsBridgeService), so this
 * always invalidates all four query groups for the affected task. That's the right
 * tradeoff here: unlike the local, scoped invalidation on every mutation (which had
 * to avoid refetching the whole board on every keystroke), a remote push fires once
 * per someone else's save, not once per keystroke — a background refetch is cheap.
 *
 * No manual reconnection logic: EventSource retries on its own after a drop, with
 * the browser's default backoff, once the very first connection has been made.
 */
export function useTaskEventsStream(): void {
  const queryClient = useQueryClient();
  const ctx = useTasksApp();

  const matchesListFilters = (task: TaskDetail, filters: TaskFilters | undefined) => {
    if (!filters) return true;
    if (filters.q) return false; // Description full-text cannot be reproduced from the event payload.
    if (filters.status?.length && !filters.status.includes(task.status)) return false;
    if (filters.assigneeUserId?.length && (!task.assignee || !filters.assigneeUserId.includes(task.assignee.id))) return false;
    if (filters.kind?.length && !filters.kind.includes(task.kind)) return false;
    if (filters.priority?.length && !filters.priority.includes(task.priority)) return false;
    if (filters.entityKind && task.entityKind !== filters.entityKind) return false;
    if (filters.entityId != null && task.entityId !== filters.entityId) return false;
    if (filters.labelId?.length && !task.labels.some((label) => filters.labelId?.includes(label.id))) return false;
    if (filters.dueBefore && (!task.dueDate || task.dueDate > filters.dueBefore)) return false;
    if (filters.dueOn && task.dueDate !== filters.dueOn) return false;
    return true;
  };

  const patchListCaches = (task: TaskDetail | null, taskId: number) => {
    for (const [queryKey, old] of queryClient.getQueriesData({ queryKey: tasksKeys.lists() })) {
      const filters = queryKey[2] as TaskFilters | undefined;
      queryClient.setQueryData(queryKey, (current: unknown) => {
        const data = current ?? old;
        if (!data || typeof data !== "object") return data;
        const record = data as { pages?: TaskListResult[]; pageParams?: unknown[]; items?: Task[] };
        const patchPage = (page: TaskListResult): TaskListResult => ({
          ...page,
          items: task
            ? page.items.some((item) => item.id === task.id)
              ? page.items.map((item) => (item.id === task.id ? task : item))
              : matchesListFilters(task, filters) && page === (record.pages?.[0] ?? record)
                ? [task, ...page.items].slice(0, 50)
                : page.items
            : page.items.filter((item) => item.id !== taskId),
        });
        if (Array.isArray(record.pages)) return { ...record, pages: record.pages.map(patchPage) };
        if (Array.isArray(record.items)) return patchPage(record as unknown as TaskListResult);
        return data;
      });
    }
  };

  const patchBoardCache = (task: TaskDetail | null, taskId: number) => {
    queryClient.setQueriesData({ queryKey: tasksKeys.board() }, (old: unknown) => {
      if (!old || typeof old !== "object") return old;
      const current = old as TaskBoardResult;
      const columns: TaskBoardResult["columns"] = {};
      let wasPresent = false;
      for (const [status, items] of Object.entries(current.columns)) {
        const next = (items ?? []).filter((item) => {
          const keep = item.id !== taskId;
          if (!keep) wasPresent = true;
          return keep;
        });
        columns[status as keyof TaskBoardResult["columns"]] = next;
      }
      if (task && task.status !== "cancelled" && (wasPresent || !task.parentId)) {
        const statusItems = columns[task.status] ?? [];
        columns[task.status] = [...statusItems, task].sort((a, b) => a.position - b.position);
      }
      return { ...current, columns };
    });
  };

  useEffect(() => {
    if (typeof EventSource === "undefined") return;

    const source = new EventSource(STREAM_URL, { withCredentials: true });

    source.addEventListener("task.changed", (event) => {
      const payload = parseTaskChangedPayload((event as MessageEvent<string>).data);
      if (!payload) return;

      void getTask(ctx, payload.taskId)
        .then((detail) => {
          queryClient.setQueryData(tasksKeys.detail(payload.taskId), detail);
          patchListCaches(detail, payload.taskId);
          patchBoardCache(detail, payload.taskId);
          queryClient.setQueriesData({ queryKey: tasksKeys.mine() }, (old: unknown) => {
            if (!old || typeof old !== "object") return old;
            const buckets = old as Record<string, Task[]>;
            const existing = Object.values(buckets).some((items) => items.some((item) => item.id === detail.id));
            if (!existing) {
              void queryClient.invalidateQueries({ queryKey: tasksKeys.mine() });
              return old;
            }
            const next = Object.fromEntries(
              Object.entries(buckets).map(([key, items]) => [
                key,
                items.map((item) => (item.id === detail.id ? detail : item)),
              ]),
            );
            return next;
          });
        })
        .catch(() => {
          queryClient.removeQueries({ queryKey: tasksKeys.detail(payload.taskId) });
          patchListCaches(null, payload.taskId);
          patchBoardCache(null, payload.taskId);
        });
    });

    return () => source.close();
  }, [ctx, queryClient]);
}
