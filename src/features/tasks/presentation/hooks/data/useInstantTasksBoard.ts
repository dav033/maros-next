"use client";

import { useQuery } from "@tanstack/react-query";
import { useTasksApp } from "@/di";
import { tasksKeys, getBoard } from "@/tasks/application";
import type { TaskBoardResult } from "@/tasks/domain";
import { buildInstantQueryResult } from "@/shared/query";
import { STALE_TIMES } from "@/shared/lib/queryClient";

const EMPTY_BOARD: TaskBoardResult = { columns: {}, doneTotalCount: 0 };

export function useInstantTasksBoard() {
  const ctx = useTasksApp();
  const query = useQuery<TaskBoardResult, Error>({
    queryKey: tasksKeys.board(),
    queryFn: () => getBoard(ctx),
    staleTime: STALE_TIMES.lists,
  });
  const result = buildInstantQueryResult<TaskBoardResult>(query, EMPTY_BOARD, STALE_TIMES.lists);
  const data = result.data ?? EMPTY_BOARD;
  return { ...result, board: data.columns, doneTotalCount: data.doneTotalCount };
}
