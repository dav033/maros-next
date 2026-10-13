"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { TaskFilters, TaskKind, TaskPriority, TaskStatus } from "@/tasks/domain";
import { addDays, format } from "date-fns";
import { todayInBusinessTimezone } from "@/shared/lib/businessDate";

export type TasksView = "board" | "list" | "mine" | "calendar";
export type TasksGroup = "status" | "job" | "assignee" | "kind";
export type TasksDueFilter = "overdue" | "today" | "thisWeek" | "noDueDate";

export interface TasksViewState {
  scope: string;
  job: number | null;
  view: TasksView;
  group: TasksGroup;
  sort: NonNullable<TaskFilters["sort"]>;
  direction: NonNullable<TaskFilters["direction"]>;
  q: string;
  status: TaskStatus[];
  assignee: number[];
  label: number[];
  kind: TaskKind[];
  priority: TaskPriority[];
  due: TasksDueFilter | null;
  workspaceId: number | null;
  folderId: number | null;
}

const VIEWS: readonly TasksView[] = ["board", "list", "mine", "calendar"];
const GROUPS: readonly TasksGroup[] = ["status", "job", "assignee", "kind"];
const SORTS: NonNullable<TaskFilters["sort"]>[] = [
  "updatedAt",
  "createdAt",
  "dueDate",
  "priority",
  "title",
];
const DIRECTIONS = ["asc", "desc"] as const;
const DUE_FILTERS: readonly TasksDueFilter[] = ["overdue", "today", "thisWeek", "noDueDate"];

function splitParam(value: string | null): string[] {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function parseNumbers(value: string | null): number[] {
  return splitParam(value).map(Number).filter(Number.isFinite);
}

export function useTasksViewState() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Opening a detail changes only `task`; board filters must retain their identity.
  const viewParams = new URLSearchParams(searchParams.toString());
  viewParams.delete("task");
  const viewQuery = viewParams.toString();

  const state = useMemo<TasksViewState>(() => {
    const params = new URLSearchParams(viewQuery);
    const viewParam = params.get("view");
    const view = VIEWS.includes(viewParam as TasksView) ? (viewParam as TasksView) : "board";
    const groupParam = params.get("group");
    const sortParam = params.get("sort");
    const directionParam = params.get("dir");
    const dueParam = params.get("due");
    const jobParam = Number(params.get("job"));
    const workspaceParam = Number(params.get("workspace"));
    const folderParam = Number(params.get("folder"));

    return {
      scope: params.get("scope") || "all",
      job: Number.isFinite(jobParam) && jobParam > 0 ? jobParam : null,
      view,
      group: GROUPS.includes(groupParam as TasksGroup) ? (groupParam as TasksGroup) : "status",
      sort: SORTS.includes(sortParam as NonNullable<TaskFilters["sort"]>)
        ? (sortParam as NonNullable<TaskFilters["sort"]>)
        : "updatedAt",
      direction: DIRECTIONS.includes(directionParam as (typeof DIRECTIONS)[number])
        ? (directionParam as (typeof DIRECTIONS)[number])
        : "desc",
      q: params.get("q") || "",
      status: splitParam(params.get("status")) as TaskStatus[],
      assignee: parseNumbers(params.get("assignee")),
      label: parseNumbers(params.get("label")),
      kind: splitParam(params.get("kind")) as TaskKind[],
      priority: splitParam(params.get("priority")) as TaskPriority[],
      due: DUE_FILTERS.includes(dueParam as TasksDueFilter) ? (dueParam as TasksDueFilter) : null,
      workspaceId: Number.isFinite(workspaceParam) && workspaceParam > 0 ? workspaceParam : null,
      folderId: Number.isFinite(folderParam) && folderParam > 0 ? folderParam : null,
    };
  }, [viewQuery]);

  const replaceState = useCallback(
    (patch: Partial<TasksViewState>) => {
      const next = new URLSearchParams(window.location.search);
      const set = (
        key: string,
        value: string | number | null | undefined,
        defaultValue?: string,
      ) => {
        if (value == null || value === "" || (defaultValue != null && String(value) === defaultValue)) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      };
      const setArray = (key: string, value: string[] | number[] | undefined) => {
        if (!value || value.length === 0) next.delete(key);
        else next.set(key, value.join(","));
      };

      if ("scope" in patch) set("scope", patch.scope, "all");
      if ("job" in patch) set("job", patch.job);
      if ("view" in patch) set("view", patch.view, "board");
      if ("group" in patch) set("group", patch.group, "status");
      if ("sort" in patch) set("sort", patch.sort, "updatedAt");
      if ("direction" in patch) set("dir", patch.direction, "desc");
      if ("q" in patch) set("q", patch.q);
      if ("status" in patch) setArray("status", patch.status);
      if ("assignee" in patch) setArray("assignee", patch.assignee);
      if ("label" in patch) setArray("label", patch.label);
      if ("kind" in patch) setArray("kind", patch.kind);
      if ("priority" in patch) setArray("priority", patch.priority);
      if ("due" in patch) set("due", patch.due);
      if ("workspaceId" in patch) set("workspace", patch.workspaceId);
      if ("folderId" in patch) set("folder", patch.folderId);

      next.delete("cursor");
      const query = next.toString();
      if (typeof window === "undefined") return;
      window.history.replaceState(
        null,
        "",
        `${pathname}${query ? `?${query}` : ""}${window.location.hash}`,
      );
    },
    [pathname],
  );

  const filters = useMemo<TaskFilters>(() => ({
    q: state.q.trim() || undefined,
    status: state.status.length ? state.status : undefined,
    assigneeUserId: state.assignee.length ? state.assignee : undefined,
    labelId: state.label.length ? state.label : undefined,
    kind: state.kind.length ? state.kind : undefined,
    priority: state.priority.length ? state.priority : undefined,
    entityKind: state.job != null ? "lead" : undefined,
    entityId: state.job ?? undefined,
    leadType: state.scope !== "all" ? (state.scope as "CONSTRUCTION" | "ROOFING" | "PLUMBING") : undefined,
    dueBefore:
      state.due === "overdue"
        ? format(addDays(new Date(`${todayInBusinessTimezone()}T00:00:00`), -1), "yyyy-MM-dd")
        : undefined,
    dueOn: state.due === "today" ? todayInBusinessTimezone() : undefined,
    sort: state.sort,
    direction: state.direction,
    workspaceId: state.workspaceId ?? undefined,
    folderId: state.folderId ?? undefined,
  }), [state]);

  return useMemo(() => ({ state, filters, replaceState }), [state, filters, replaceState]);
}
