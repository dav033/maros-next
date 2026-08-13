"use client";

import { useMemo, useState } from "react";
import { isValid, parse } from "date-fns";
import { Filter, Search, X } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageToolbarCard } from "@/components/shared";
import { cn } from "@/lib/utils";
import { todayInBusinessTimezone } from "@/shared/lib/businessDate";
import { BOARD_STATUSES } from "@/tasks/domain";
import type { Task, TaskStatus } from "@/tasks/domain";
import { useInstantTasksBoard } from "../hooks/data/useInstantTasksBoard";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { TaskCard } from "../molecules/TaskCard";
import { BlockedReasonDialog } from "../molecules/BlockedReasonDialog";
import { TASK_STATUS_LABELS } from "../atoms/taskVisualTokens";
import { resolveCardDropSide } from "./taskBoardDragUtil";

const COLUMN_PREFIX = "column:";

type QuickFilter = "overdue" | "today" | "in_progress" | "blocked" | null;

const DATE_FORMAT = "yyyy-MM-dd";

function isActiveTask(task: Task): boolean {
  return task.status !== "done" && task.status !== "cancelled";
}

/**
 * Compares the raw `YYYY-MM-DD` strings against "today" in the business's timezone —
 * not `new Date()` in the viewer's own timezone — so these counts agree with the
 * backend's due-date bucketing (My tasks, the daily digest) instead of drifting by a
 * day for anyone outside America/New_York, or near midnight for everyone.
 */
function dueRelation(dueDate: string | null): "overdue" | "today" | "future" | null {
  if (!dueDate) return null;
  if (!isValid(parse(dueDate, DATE_FORMAT, new Date()))) return null;
  const today = todayInBusinessTimezone();
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  return "future";
}

/** Quick-filter pill: a togglable stat button, same on/off pair of styles per color. */
function QuickFilterPill({
  label,
  count,
  active,
  activeClassName,
  countClassName,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  activeClassName: string;
  countClassName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
        active ? activeClassName : "text-muted-foreground hover:bg-muted/60"
      )}
    >
      <span className={cn("font-semibold", active ? undefined : countClassName)}>{count}</span>
      {label}
    </button>
  );
}

function SortableTaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}

function BoardColumn({
  status,
  tasks,
  onCardClick,
}: {
  status: TaskStatus;
  tasks: Task[];
  onCardClick: (id: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${COLUMN_PREFIX}${status}` });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border border-border/50 bg-muted/20 transition-colors",
        isOver && "border-primary/50 bg-primary/5"
      )}
    >
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {TASK_STATUS_LABELS[status]}
        </span>
        <span className="rounded-full bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {tasks.length}
        </span>
      </div>
      <div className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto p-2">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onClick={() => onCardClick(task.id)} />
          ))}
        </SortableContext>
        {tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/40 px-2 py-6 text-center text-xs text-muted-foreground">
            No tasks
          </div>
        ) : null}
      </div>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {BOARD_STATUSES.map((status) => (
        <div key={status} className="w-72 shrink-0 space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
}

export function TaskBoard({ onOpenTask }: { onOpenTask: (id: number) => void }) {
  const { board, showSkeleton } = useInstantTasksBoard();
  const { moveMutation } = useTaskMutations();

  const [pendingBlock, setPendingBlock] = useState<{
    taskId: number;
    beforeId?: number;
    afterId?: number;
  } | null>(null);

  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Flat id -> status lookup, so onDragEnd can tell which column a dropped-on card
  // belongs to (over.id is the card's id, not the column's, whenever there's a card
  // under the pointer). Built off the unfiltered board — a dragged card's true
  // column never depends on what search/quick-filter currently hide.
  const taskStatusById = useMemo(() => {
    const map = new Map<number, TaskStatus>();
    for (const status of BOARD_STATUSES) {
      for (const task of board[status] ?? []) map.set(task.id, status);
    }
    return map;
  }, [board]);

  // Search narrows first, quick-filter counts are read off that (matches the count
  // badges to what search already excluded), then quick-filter narrows what's shown.
  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result: Partial<Record<TaskStatus, Task[]>> = {};
    for (const status of BOARD_STATUSES) {
      const tasks = board[status] ?? [];
      result[status] = q ? tasks.filter((t) => t.title.toLowerCase().includes(q)) : tasks;
    }
    return result;
  }, [board, search]);

  const stats = useMemo(() => {
    let overdue = 0;
    let today = 0;
    let inProgress = 0;
    let blocked = 0;
    for (const status of BOARD_STATUSES) {
      for (const task of searched[status] ?? []) {
        if (task.status === "in_progress") inProgress += 1;
        if (task.status === "blocked") blocked += 1;
        if (isActiveTask(task)) {
          const relation = dueRelation(task.dueDate);
          if (relation === "overdue") overdue += 1;
          if (relation === "today") today += 1;
        }
      }
    }
    return { overdue, today, inProgress, blocked };
  }, [searched]);

  const matchesQuickFilter = (task: Task): boolean => {
    if (!quickFilter) return true;
    if (quickFilter === "overdue") return isActiveTask(task) && dueRelation(task.dueDate) === "overdue";
    if (quickFilter === "today") return isActiveTask(task) && dueRelation(task.dueDate) === "today";
    if (quickFilter === "in_progress") return task.status === "in_progress";
    if (quickFilter === "blocked") return task.status === "blocked";
    return true;
  };

  const filteredBoard = useMemo(() => {
    const result: Partial<Record<TaskStatus, Task[]>> = {};
    for (const status of BOARD_STATUSES) {
      result[status] = (searched[status] ?? []).filter(matchesQuickFilter);
    }
    return result;
  }, [searched, quickFilter]);

  const toggleQuickFilter = (value: Exclude<QuickFilter, null>) =>
    setQuickFilter((current) => (current === value ? null : value));

  const resolveTargetStatus = (overId: string | number): TaskStatus | null => {
    if (typeof overId === "string" && overId.startsWith(COLUMN_PREFIX)) {
      return overId.slice(COLUMN_PREFIX.length) as TaskStatus;
    }
    return taskStatusById.get(Number(overId)) ?? null;
  };

  const commitMove = (
    taskId: number,
    status: TaskStatus,
    beforeId?: number,
    afterId?: number,
    blockedReason?: string
  ) => {
    moveMutation.mutate({ id: taskId, input: { status, beforeId, afterId, blockedReason } });
  };

  // Never `filteredBoard` here — a quick filter or search can hide the very cards
  // whose order resolveCardDropSide depends on to tell up from down.
  const resolveDropTarget = (
    taskId: number,
    targetStatus: TaskStatus,
    overId: string | number
  ): { beforeId?: number; afterId?: number } => {
    const overIsCard = typeof overId !== "string" || !overId.startsWith(COLUMN_PREFIX);
    if (!overIsCard) return {};

    const overTaskId = Number(overId);
    const targetList = board[targetStatus] ?? [];
    const side = resolveCardDropSide(targetList, taskId, overTaskId);

    return side === "after" ? { afterId: overTaskId } : { beforeId: overTaskId };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = Number(active.id);
    const fromStatus = taskStatusById.get(taskId);
    const targetStatus = resolveTargetStatus(over.id);
    if (!fromStatus || !targetStatus) return;

    const { beforeId, afterId } = resolveDropTarget(taskId, targetStatus, over.id);

    if (fromStatus === targetStatus && (beforeId === taskId || afterId === taskId)) return;

    if (targetStatus === "blocked") {
      setPendingBlock({ taskId, beforeId, afterId });
      return;
    }

    commitMove(taskId, targetStatus, beforeId, afterId);
  };

  if (showSkeleton) {
    return <BoardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-3">
      <PageToolbarCard icon={Filter} label="Filters & search">
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

        <div className="flex flex-wrap items-center gap-1.5">
          <QuickFilterPill
            label="overdue"
            count={stats.overdue}
            active={quickFilter === "overdue"}
            activeClassName="bg-destructive/15 text-destructive"
            countClassName="text-destructive"
            onClick={() => toggleQuickFilter("overdue")}
          />
          <QuickFilterPill
            label="today"
            count={stats.today}
            active={quickFilter === "today"}
            activeClassName="bg-amber-500/15 text-amber-500"
            countClassName="text-amber-500"
            onClick={() => toggleQuickFilter("today")}
          />
          <QuickFilterPill
            label="in progress"
            count={stats.inProgress}
            active={quickFilter === "in_progress"}
            activeClassName="bg-foreground/10 text-foreground"
            countClassName="text-foreground"
            onClick={() => toggleQuickFilter("in_progress")}
          />
          <QuickFilterPill
            label="blocked"
            count={stats.blocked}
            active={quickFilter === "blocked"}
            activeClassName="bg-destructive/15 text-destructive"
            countClassName="text-destructive"
            onClick={() => toggleQuickFilter("blocked")}
          />
        </div>
      </PageToolbarCard>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {BOARD_STATUSES.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={filteredBoard[status] ?? []}
              onCardClick={onOpenTask}
            />
          ))}
        </div>
      </DndContext>

      <BlockedReasonDialog
        open={pendingBlock !== null}
        onCancel={() => setPendingBlock(null)}
        onConfirm={(reason) => {
          if (!pendingBlock) return;
          commitMove(pendingBlock.taskId, "blocked", pendingBlock.beforeId, pendingBlock.afterId, reason);
          setPendingBlock(null);
        }}
      />
    </div>
  );
}
