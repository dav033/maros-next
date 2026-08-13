"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { tasksKeys } from "@/tasks/application";
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

  useEffect(() => {
    if (typeof EventSource === "undefined") return;

    const source = new EventSource(STREAM_URL, { withCredentials: true });

    source.addEventListener("task.changed", (event) => {
      const payload = parseTaskChangedPayload((event as MessageEvent<string>).data);
      if (!payload) return;

      void queryClient.invalidateQueries({ queryKey: tasksKeys.board() });
      void queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: tasksKeys.mine() });
      void queryClient.invalidateQueries({ queryKey: tasksKeys.detail(payload.taskId) });
    });

    return () => source.close();
  }, [queryClient]);
}
