"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTasksApp } from "@/di";
import { tasksKeys, getMyTasks } from "@/tasks/application";
import type { Task } from "@/tasks/domain";
import { buildInstantQueryResult } from "@/shared/query";
import { STALE_TIMES } from "@/shared/lib/queryClient";

export type MyTasksBucketKey = "overdue" | "today" | "thisWeek" | "later" | "noDueDate";

export type MyTasksBuckets = Record<MyTasksBucketKey, Task[]>;

const EMPTY_BUCKETS: MyTasksBuckets = {
  overdue: [],
  today: [],
  thisWeek: [],
  later: [],
  noDueDate: [],
};

const MINE_CACHE_KEY = "maros-tasks-mine-cache-v1";

function readMineCache(): Record<string, Task[]> | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(MINE_CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { data?: Record<string, Task[]> };
    return parsed.data && typeof parsed.data === "object" ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

/** overdue / today / thisWeek / later / noDueDate — see TasksRepositoryPort.getMine. */
export function useInstantMyTasks() {
  const ctx = useTasksApp();
  const query = useQuery<Record<string, Task[]>, Error>({
    queryKey: tasksKeys.mine(),
    queryFn: async () => {
      try {
        return await getMyTasks(ctx);
      } catch (error) {
        if (typeof navigator !== "undefined" && !navigator.onLine) return readMineCache() ?? EMPTY_BUCKETS;
        throw error;
      }
    },
    initialData: readMineCache,
    staleTime: STALE_TIMES.lists,
  });
  useEffect(() => {
    if (!query.data || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(MINE_CACHE_KEY, JSON.stringify({ updatedAt: Date.now(), data: query.data }));
    } catch {
      // Storage quota/private mode must not make the task view fail.
    }
  }, [query.data]);
  const result = buildInstantQueryResult<Record<string, Task[]>>(query, {}, STALE_TIMES.lists);
  const buckets: MyTasksBuckets = { ...EMPTY_BUCKETS, ...result.data };
  return { ...result, buckets };
}
