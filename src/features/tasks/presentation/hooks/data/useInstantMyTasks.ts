"use client";

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

/** overdue / today / thisWeek / later / noDueDate — see TasksRepositoryPort.getMine. */
export function useInstantMyTasks() {
  const ctx = useTasksApp();
  const query = useQuery<Record<string, Task[]>, Error>({
    queryKey: tasksKeys.mine(),
    queryFn: () => getMyTasks(ctx),
    staleTime: STALE_TIMES.lists,
  });
  const result = buildInstantQueryResult<Record<string, Task[]>>(query, {}, STALE_TIMES.lists);
  const buckets: MyTasksBuckets = { ...EMPTY_BUCKETS, ...result.data };
  return { ...result, buckets };
}
