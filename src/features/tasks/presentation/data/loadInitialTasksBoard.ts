import { headers } from "next/headers";
import type { TaskBoardResult, TaskFilters } from "@/tasks/domain";
import { getBoard, makeTasksAppContext } from "@/tasks/application";
import { TasksHttpRepository, TaskLabelsHttpRepository } from "@/tasks/infra";
import { TaskWorkspacesHttpRepository } from "@/features/task-workspaces/infra";
import { createServerApiClient } from "@/shared/infra/http";

export type InitialTasksBoard = {
  data: TaskBoardResult;
  filters: TaskFilters;
  updatedAt: number;
};

type TasksSearchParams = Record<string, string | string[] | undefined>;

const FILTER_PARAMS = [
  "q",
  "status",
  "assignee",
  "label",
  "kind",
  "priority",
  "scope",
  "job",
  "due",
  "workspace",
  "folder",
] as const;

const SORTS = ["updatedAt", "createdAt", "dueDate", "priority", "title"] as const;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getUnfilteredBoardFilters(params: TasksSearchParams): TaskFilters | null {
  const view = first(params.view);
  if (view && view !== "board") return null;
  if (FILTER_PARAMS.some((key) => params[key] !== undefined)) return null;

  const sortValue = first(params.sort);
  const directionValue = first(params.dir);
  const sort = SORTS.find((candidate) => candidate === sortValue) ?? "updatedAt";
  const direction = directionValue === "asc" ? "asc" : "desc";
  return { sort, direction };
}

export async function loadInitialTasksBoard(
  params: TasksSearchParams,
): Promise<InitialTasksBoard | null> {
  const filters = getUnfilteredBoardFilters(params);
  if (!filters) return null;

  const apiClient = createServerApiClient(await headers());
  const ctx = makeTasksAppContext({
    repos: {
      task: new TasksHttpRepository(apiClient),
      label: new TaskLabelsHttpRepository(apiClient),
      workspace: new TaskWorkspacesHttpRepository(apiClient),
    },
  });

  try {
    return {
      data: await getBoard(ctx, filters),
      filters,
      updatedAt: Date.now(),
    };
  } catch {
    console.error("[loadInitialTasksBoard] Failed to load the initial task board");
    return null;
  }
}
