"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, ListTodo, Search, X } from "lucide-react";
import { PageHeaderCard, PageToolbarCard, MultiSelectFilter } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TASK_KINDS, TASK_PRIORITIES, TASK_STATUSES } from "@/tasks/domain";
import type { TaskKind, TaskPriority, TaskStatus } from "@/tasks/domain";
import { useInstantTasksList } from "../hooks/data/useInstantTasksList";
import { TaskListTable } from "../organisms/TaskListTable";
import { TaskBulkActionBar } from "../organisms/TaskBulkActionBar";
import { CreateTaskDialog } from "../organisms/CreateTaskDialog";
import { TaskDetailSheet } from "../organisms/TaskDetailSheet";
import { TaskViewSwitcher } from "../molecules/TaskViewSwitcher";
import { useTaskDetailRoute } from "../hooks/useTaskDetailRoute";
import {
  TASK_KIND_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
} from "../atoms/taskVisualTokens";

const STATUS_OPTIONS = TASK_STATUSES.map((s) => ({
  value: s,
  label: TASK_STATUS_LABELS[s],
  color: TASK_STATUS_COLORS[s],
}));
const PRIORITY_OPTIONS = TASK_PRIORITIES.map((p) => ({ value: p, label: TASK_PRIORITY_LABELS[p] }));
const KIND_OPTIONS = TASK_KINDS.map((k) => ({ value: k, label: TASK_KIND_LABELS[k] }));

/**
 * Status/priority/kind filter on the server now (SearchTasksDto accepts several
 * values per field — see toArray.util on the backend), so a narrow filter no longer
 * means downloading every top-level task just to discard most of them client-side.
 * Only the title search box stays client-side, over whatever the server already
 * narrowed it to — a full round trip per keystroke isn't worth it for that.
 */
export function TasksListPageView() {
  const { taskId, openTask, closeTask } = useTaskDetailRoute();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  // Seeds from ?status=… once, on first render — e.g. the board's "view all N
  // completed" link (see TaskBoard) lands here with ?status=done pre-applied.
  const [statusFilter, setStatusFilter] = useState<Set<TaskStatus>>(() => {
    const fromUrl = searchParams.get("status");
    return fromUrl && (TASK_STATUSES as readonly string[]).includes(fromUrl)
      ? new Set([fromUrl as TaskStatus])
      : new Set();
  });
  const [priorityFilter, setPriorityFilter] = useState<Set<TaskPriority>>(new Set());
  const [kindFilter, setKindFilter] = useState<Set<TaskKind>>(new Set());
  // Owns the checkbox selection for TaskBulkActionBar — EntityTable clears entries
  // that scroll out of the current filtered/loaded set on its own.
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());

  const { tasks, totalCount, showSkeleton } = useInstantTasksList({
    status: statusFilter.size > 0 ? Array.from(statusFilter) : undefined,
    priority: priorityFilter.size > 0 ? Array.from(priorityFilter) : undefined,
    kind: kindFilter.size > 0 ? Array.from(kindFilter) : undefined,
  });
  // The server caps how many it'll ever return in one response (see the backend's
  // TasksRepository.LIST_LIMIT) — this is true independent of the search box, which
  // only narrows what's already loaded.
  const isCapped = tasks.length < totalCount;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? tasks.filter((task) => task.title.toLowerCase().includes(q)) : tasks;
  }, [tasks, search]);

  return (
    <main className="flex min-h-[calc(100vh-80px)] w-full flex-col gap-3 bg-background px-3 py-3 pt-16 sm:gap-4 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:pt-6">
      <PageHeaderCard
        icon={ListTodo}
        title="Tasks"
        description="What needs doing, who's doing it, and what it's waiting on."
        rightSlot={<CreateTaskDialog onCreated={openTask} />}
        belowSlot={<TaskViewSwitcher current="list" />}
      />

      <PageToolbarCard
        icon={Filter}
        label="Filters & search"
        resultCount={filtered.length}
        totalCount={tasks.length}
      >
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="h-9 border-border/60 bg-background/60 pl-9"
          />
          {search.trim().length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 px-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div className="w-40 shrink-0">
          <MultiSelectFilter
            placeholder="All statuses"
            options={STATUS_OPTIONS}
            selected={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
        <div className="w-36 shrink-0">
          <MultiSelectFilter
            placeholder="All priorities"
            options={PRIORITY_OPTIONS}
            selected={priorityFilter}
            onChange={setPriorityFilter}
          />
        </div>
        <div className="w-40 shrink-0">
          <MultiSelectFilter
            placeholder="All kinds"
            options={KIND_OPTIONS}
            selected={kindFilter}
            onChange={setKindFilter}
          />
        </div>
      </PageToolbarCard>

      {isCapped ? (
        <p className="text-xs text-muted-foreground">
          Showing the first {tasks.length.toLocaleString()} of {totalCount.toLocaleString()} matching
          tasks — narrow the filters above to see the rest.
        </p>
      ) : null}

      <section className="dashboard-section-enter mt-2 flex-1">
        <TaskListTable
          tasks={filtered}
          isLoading={showSkeleton}
          onOpenTask={openTask}
          selection={{ selectedIds, onSelectionChange: setSelectedIds }}
        />
      </section>

      <TaskDetailSheet taskId={taskId} onClose={closeTask} onOpenTask={openTask} />

      <TaskBulkActionBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds(new Set())}
      />
    </main>
  );
}
