"use client";

import { useEffect, useRef, useState } from "react";
import { Filter, ListTodo, Search, X } from "lucide-react";
import { PageHeaderCard, PageToolbarCard, MultiSelectFilter } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TASK_KINDS, TASK_PRIORITIES, TASK_STATUSES } from "@/tasks/domain";
import type { TaskKind, TaskPriority, TaskStatus } from "@/tasks/domain";
import { useInstantTasksList } from "../hooks/data/useInstantTasksList";
import { useTasksViewState } from "../hooks/useTasksViewState";
import { TaskListTable } from "../organisms/TaskListTable";
import { TaskBulkActionBar } from "../organisms/TaskBulkActionBar";
import { CreateTaskDialog } from "../organisms/CreateTaskDialog";
import { TaskDetailSheet } from "../organisms/TaskDetailSheet";
import { TaskViewSwitcher } from "../molecules/TaskViewSwitcher";
import { TaskScopeBar } from "../molecules/TaskScopeBar";
import { TaskSavedViews } from "../molecules/TaskSavedViews";
import { useTaskDetailRoute } from "../hooks/useTaskDetailRoute";
import { TASK_SEARCH_INPUT_ID } from "../organisms/TaskKeyboardShortcuts";
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
  const { state, filters, replaceState } = useTasksViewState();
  const [searchDraft, setSearchDraft] = useState(state.q);
  useEffect(() => setSearchDraft(state.q), [state.q]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchDraft !== state.q) replaceState({ q: searchDraft });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [replaceState, searchDraft, state.q]);
  // Owns the checkbox selection for TaskBulkActionBar — EntityTable clears entries
  // that scroll out of the current filtered/loaded set on its own.
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());

  const { tasks, totalCount, showSkeleton, hasNextPage, loadMore, isLoadingMore } =
    useInstantTasksList(filters);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingMore) void loadMore();
      },
      { rootMargin: "320px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isLoadingMore, loadMore]);

  return (
    <div className="flex w-full flex-1 flex-col gap-3 sm:gap-4">
      <PageHeaderCard
        icon={ListTodo}
        title="Tasks"
        description="What needs doing, who's doing it, and what it's waiting on."
        rightSlot={<CreateTaskDialog onCreated={openTask} />}
        belowSlot={<div className="flex flex-wrap items-center gap-3"><TaskViewSwitcher current="list" /><TaskScopeBar /><TaskSavedViews /></div>}
      />

      <PageToolbarCard
        icon={Filter}
        label="Filters & search"
        resultCount={tasks.length}
        totalCount={totalCount}
      >
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={TASK_SEARCH_INPUT_ID}
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Search tasks…"
            className="h-9 border-border/60 bg-background/60 pl-9"
          />
          {state.q.trim().length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => replaceState({ q: "" })}
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
            selected={new Set(state.status)}
            onChange={(value) => replaceState({ status: Array.from(value) as TaskStatus[] })}
          />
        </div>
        <div className="w-36 shrink-0">
          <MultiSelectFilter
            placeholder="All priorities"
            options={PRIORITY_OPTIONS}
            selected={new Set(state.priority)}
            onChange={(value) => replaceState({ priority: Array.from(value) as TaskPriority[] })}
          />
        </div>
        <div className="w-40 shrink-0">
          <MultiSelectFilter
            placeholder="All kinds"
            options={KIND_OPTIONS}
            selected={new Set(state.kind)}
            onChange={(value) => replaceState({ kind: Array.from(value) as TaskKind[] })}
          />
        </div>
      </PageToolbarCard>

      <section className="dashboard-section-enter mt-2 flex-1">
        <TaskListTable
          tasks={tasks}
          isLoading={showSkeleton}
          onOpenTask={openTask}
          selection={{ selectedIds, onSelectionChange: setSelectedIds }}
        />
        <div ref={loadMoreRef} className="flex min-h-12 items-center justify-center py-3">
          {hasNextPage ? (
            <Button type="button" variant="ghost" onClick={() => void loadMore()} disabled={isLoadingMore}>
              {isLoadingMore ? "Loading…" : `Load more (${Math.max(totalCount - tasks.length, 0)})`}
            </Button>
          ) : null}
        </div>
      </section>

      <TaskDetailSheet taskId={taskId} onClose={closeTask} onOpenTask={openTask} />

      <TaskBulkActionBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds(new Set())}
      />
    </div>
  );
}
