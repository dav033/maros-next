"use client";

import { useQuery } from "@tanstack/react-query";
import { useTasksApp } from "@/di";
import { tasksKeys, getBoard } from "@/tasks/application";
import type { TaskBoardColumns } from "@/tasks/domain";
import { buildInstantQueryResult } from "@/shared/query";
import { STALE_TIMES } from "@/shared/lib/queryClient";

export function useInstantTasksBoard() {
  const ctx = useTasksApp();
  const query = useQuery<TaskBoardColumns, Error>({
    queryKey: tasksKeys.board(),
    queryFn: () => getBoard(ctx),
    staleTime: STALE_TIMES.lists,
  });
  const result = buildInstantQueryResult<TaskBoardColumns>(query, {}, STALE_TIMES.lists);
  return { ...result, board: result.data ?? {} };
}
