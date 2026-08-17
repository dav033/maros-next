"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo<TasksViewState>(() => {
    const viewParam = searchParams.get("view");
    const view = VIEWS.includes(viewParam as TasksView) ? (viewParam as TasksView) : "board";
    const groupParam = searchParams.get("group");
    const sortParam = searchParams.get("sort");
    const directionParam = searchParams.get("dir");
    const dueParam = searchParams.get("due");
    const jobParam = Number(searchParams.get("job"));

    return {
      scope: searchParams.get("scope") || "all",
      job: Number.isFinite(jobParam) && jobParam > 0 ? jobParam : null,
      view,
      group: GROUPS.includes(groupParam as TasksGroup) ? (groupParam as TasksGroup) : "status",
      sort: SORTS.includes(sortParam as NonNullable<TaskFilters["sort"]>)
        ? (sortParam as NonNullable<TaskFilters["sort"]>)
        : "updatedAt",
      direction: DIRECTIONS.includes(directionParam as (typeof DIRECTIONS)[number])
        ? (directionParam as (typeof DIRECTIONS)[number])
        : "desc",
      q: searchParams.get("q") || "",
      status: splitParam(searchParams.get("status")) as TaskStatus[],
      assignee: parseNumbers(searchParams.get("assignee")),
      label: parseNumbers(searchParams.get("label")),
      kind: splitParam(searchParams.get("kind")) as TaskKind[],
      priority: splitParam(searchParams.get("priority")) as TaskPriority[],
      due: DUE_FILTERS.includes(dueParam as TasksDueFilter) ? (dueParam as TasksDueFilter) : null,
    };
  }, [searchParams]);

  const replaceState = useCallback(
    (patch: Partial<TasksViewState>) => {
      const next = new URLSearchParams(searchParams.toString());
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

      next.delete("cursor");
      const query = next.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [pathname, router, searchParams],
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
  }), [state]);

  return { state, filters, replaceState };
}
