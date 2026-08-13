"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { isValid, parse } from "date-fns";
import { Filter, Rows3, Search, X } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
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
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";
import { useCurrentUser } from "@/shared/auth/CurrentUserProvider";
import { useUserDirectory } from "@/features/users/presentation/hooks/data/useUserDirectory";
import { BOARD_STATUSES } from "@/tasks/domain";
import type { Task, TaskBoardColumns, TaskStatus } from "@/tasks/domain";
import { useInstantTasksBoard } from "../hooks/data/useInstantTasksBoard";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { TaskCard } from "../molecules/TaskCard";
import { AssigneeFilterDropdown } from "../molecules/AssigneeFilterDropdown";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { BlockedReasonDialog } from "../molecules/BlockedReasonDialog";
import { TASK_STATUS_LABELS } from "../atoms/taskVisualTokens";
import { resolveCardDropSide } from "./taskBoardDragUtil";
import { applyOptimisticMove } from "./taskBoardOptimisticMove";
import { matchesAssigneeFilter, type AssigneeFilterKey } from "./taskBoardAssigneeFilter";
import { groupTasksByAssignee } from "./taskBoardAssigneeGroups";
import { TASK_SEARCH_INPUT_ID } from "./TaskKeyboardShortcuts";

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
  const prefersReducedMotion = usePrefersReducedMotion();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: prefersReducedMotion ? undefined : transition,
    // The dragged card itself: DragOverlay renders the crisp, floating copy that
    // follows the cursor (see TaskBoard) — this is just its dimmed, still-in-the-flow
    // placeholder, so the layout doesn't jump.
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
  totalCount,
  onCardClick,
}: {
  status: TaskStatus;
  tasks: Task[];
  /** Only set (and only ever exceeding tasks.length) for `done` — see TaskBoard. */
  totalCount?: number;
  onCardClick: (id: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${COLUMN_PREFIX}${status}` });
  const hasMoreThanShown = totalCount != null && totalCount > tasks.length;

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
          {hasMoreThanShown ? `${tasks.length} of ${totalCount}` : tasks.length}
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
      {hasMoreThanShown ? (
        // Only the most recent DONE_LIMIT/DONE_WINDOW_DAYS worth of completed tasks
        // load onto the board at all (see the backend's TasksRepository.findForBoard)
        // — the rest are one click away in the list, not silently missing.
        <Link
          href="/tasks/list?status=done"
          className="border-t border-border/40 px-3 py-2 text-center text-[11px] font-medium text-primary hover:underline"
        >
          View all {totalCount} completed
        </Link>
      ) : null}
    </div>
  );
}

/**
 * One row per assignee, read-only — the workload-distribution view from the plan.
 * Deliberately no dnd-kit here: a card dropped into another assignee's row would
 * need to both change status AND reassign in one step, and the board's optimistic
 * preview machinery (applyOptimisticMove) only knows about status/position, not
 * assignee. Switch back to the normal board to drag; use this one to see who's
 * carrying what.
 */
function AssigneeSwimlane({
  group,
  onCardClick,
}: {
  group: ReturnType<typeof groupTasksByAssignee>[number];
  onCardClick: (id: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/10 p-3">
      <div className="flex items-center gap-2">
        <AssigneeAvatar person={group.person} size="md" />
        <span className="text-sm font-medium text-foreground">
          {group.person ? (group.person.name ?? group.person.email) : "Unassigned"}
        </span>
        <span className="rounded-full bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {group.total}
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {BOARD_STATUSES.map((status) => {
          const tasks = group.columns[status] ?? [];
          return (
            <div
              key={status}
              className="flex w-56 shrink-0 flex-col gap-2 rounded-lg border border-border/40 bg-background/40 p-2"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {TASK_STATUS_LABELS[status]}
                </span>
                <span className="text-[10px] text-muted-foreground">{tasks.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => onCardClick(task.id)} />
                ))}
                {tasks.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border/30 px-2 py-3 text-center text-[10px] text-muted-foreground">
                    —
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
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
  const { board, doneTotalCount, showSkeleton } = useInstantTasksBoard();
  const { moveMutation } = useTaskMutations();
  const { user } = useCurrentUser();
  // Always on (not gated behind a picker opening) — the assignee filter and the
  // swimlane view both need names/avatars up front, not just once someone clicks in.
  const { users: directoryUsers } = useUserDirectory(true);

  const [pendingBlock, setPendingBlock] = useState<{
    taskId: number;
    beforeId?: number;
    afterId?: number;
  } | null>(null);

  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<Set<AssigneeFilterKey>>(new Set());
  const [groupByAssignee, setGroupByAssignee] = useState(false);

  // Which card is being dragged (for DragOverlay) and where it would land if dropped
  // right now (for the live reorder preview) — both reset on drop or cancel. Neither
  // touches the query cache; that only happens on a real drop (see
  // taskBoardOptimisticMove, wired in useTaskMutations' moveMutation).
  const [activeId, setActiveId] = useState<number | null>(null);
  const [dragPreview, setDragPreview] = useState<{
    taskId: number;
    toStatus: TaskStatus;
    beforeId?: number;
    afterId?: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Flat id -> status/task lookups, always off the pristine `board` — never
  // `displayBoard` below, whose preview reordering must be recomputed fresh from the
  // real positions on every dragover tick rather than compounding on itself.
  const { taskStatusById, taskById } = useMemo(() => {
    const statusMap = new Map<number, TaskStatus>();
    const taskMap = new Map<number, Task>();
    for (const status of BOARD_STATUSES) {
      for (const task of board[status] ?? []) {
        statusMap.set(task.id, status);
        taskMap.set(task.id, task);
      }
    }
    return { taskStatusById: statusMap, taskById: taskMap };
  }, [board]);

  // What actually renders: the real board, with the active drag's hypothetical
  // placement previewed in — see dragPreview and applyOptimisticMove. Recomputed
  // fresh from `board` each time, so a fast drag across several columns never
  // compounds rounding/ordering drift from its own previous preview.
  const displayBoard: TaskBoardColumns = useMemo(
    () => (dragPreview ? applyOptimisticMove(board, dragPreview) : board),
    [board, dragPreview]
  );

  // Search narrows first, quick-filter counts are read off that (matches the count
  // badges to what search already excluded), then quick-filter narrows what's shown.
  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result: Partial<Record<TaskStatus, Task[]>> = {};
    for (const status of BOARD_STATUSES) {
      const tasks = displayBoard[status] ?? [];
      result[status] = q ? tasks.filter((t) => t.title.toLowerCase().includes(q)) : tasks;
    }
    return result;
  }, [displayBoard, search]);

  const stats = useMemo(() => {
    let overdue = 0;
    let today = 0;
    let inProgress = 0;
    let blocked = 0;
    let mine = 0;
    for (const status of BOARD_STATUSES) {
      for (const task of searched[status] ?? []) {
        if (task.status === "in_progress") inProgress += 1;
        if (task.status === "blocked") blocked += 1;
        if (user && task.assignee?.id === user.id) mine += 1;
        if (isActiveTask(task)) {
          const relation = dueRelation(task.dueDate);
          if (relation === "overdue") overdue += 1;
          if (relation === "today") today += 1;
        }
      }
    }
    return { overdue, today, inProgress, blocked, mine };
  }, [searched, user]);

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
      result[status] = (searched[status] ?? []).filter(
        (t) => matchesQuickFilter(t) && matchesAssigneeFilter(t, assigneeFilter)
      );
    }
    return result;
  }, [searched, quickFilter, assigneeFilter]);

  const toggleQuickFilter = (value: Exclude<QuickFilter, null>) =>
    setQuickFilter((current) => (current === value ? null : value));

  const onlyMineActive = user != null && assigneeFilter.size === 1 && assigneeFilter.has(user.id);
  const toggleOnlyMine = () => {
    if (!user) return;
    setAssigneeFilter(onlyMineActive ? new Set() : new Set([user.id]));
  };

  const assigneeGroups = useMemo(
    () => (groupByAssignee ? groupTasksByAssignee(filteredBoard) : []),
    [groupByAssignee, filteredBoard]
  );

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

  // Always the pristine `board` here, never displayBoard/filteredBoard — a quick
  // filter, search, or the preview's own hypothetical reordering can hide or move the
  // very cards resolveCardDropSide depends on to tell up from down.
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setDragPreview(null);
      return;
    }

    const taskId = Number(active.id);
    const targetStatus = resolveTargetStatus(over.id);
    if (!targetStatus) {
      setDragPreview(null);
      return;
    }

    const { beforeId, afterId } = resolveDropTarget(taskId, targetStatus, over.id);
    setDragPreview({ taskId, toStatus: targetStatus, beforeId, afterId });
  };

  const resetDragState = () => {
    setActiveId(null);
    setDragPreview(null);
  };

  const handleDragCancel = () => {
    resetDragState();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    resetDragState();
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

  const activeTask = activeId != null ? taskById.get(activeId) ?? null : null;

  const announcements: Announcements = {
    onDragStart({ active }) {
      const task = taskById.get(Number(active.id));
      return task ? `Picked up task ${task.title}.` : undefined;
    },
    onDragOver({ active, over }) {
      const task = taskById.get(Number(active.id));
      const status = over ? resolveTargetStatus(over.id) : null;
      if (!task || !status) return undefined;
      return `Task ${task.title} is over the ${TASK_STATUS_LABELS[status]} column.`;
    },
    onDragEnd({ active, over }) {
      const task = taskById.get(Number(active.id));
      if (!task) return undefined;
      if (!over) return `Moving task ${task.title} was cancelled.`;
      const status = resolveTargetStatus(over.id);
      return status
        ? `Task ${task.title} was moved to the ${TASK_STATUS_LABELS[status]} column.`
        : undefined;
    },
    onDragCancel({ active }) {
      const task = taskById.get(Number(active.id));
      return task ? `Moving task ${task.title} was cancelled.` : undefined;
    },
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
            id={TASK_SEARCH_INPUT_ID}
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
          {user ? (
            <QuickFilterPill
              label="only mine"
              count={stats.mine}
              active={onlyMineActive}
              activeClassName="bg-primary/15 text-primary"
              countClassName="text-primary"
              onClick={toggleOnlyMine}
            />
          ) : null}
        </div>

        <div className="w-44 shrink-0">
          <AssigneeFilterDropdown
            users={directoryUsers}
            selected={assigneeFilter}
            onChange={setAssigneeFilter}
          />
        </div>

        <Button
          type="button"
          variant={groupByAssignee ? "secondary" : "outline"}
          size="sm"
          className="h-9 gap-1.5 border-border/60"
          onClick={() => setGroupByAssignee((current) => !current)}
        >
          <Rows3 className="h-3.5 w-3.5" />
          Group by assignee
        </Button>
      </PageToolbarCard>

      {groupByAssignee ? (
        <div className="flex flex-col gap-3">
          {assigneeGroups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/50 px-4 py-10 text-center text-sm text-muted-foreground">
              No tasks match the current filters.
            </div>
          ) : (
            assigneeGroups.map((group) => (
              <AssigneeSwimlane key={group.key} group={group} onCardClick={onOpenTask} />
            ))
          )}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          accessibility={{ announcements }}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex gap-3 overflow-x-auto pb-2">
            {BOARD_STATUSES.map((status) => (
              <BoardColumn
                key={status}
                status={status}
                tasks={filteredBoard[status] ?? []}
                totalCount={status === "done" ? doneTotalCount : undefined}
                onCardClick={onOpenTask}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
            {activeTask ? <TaskCard task={activeTask} className="shadow-lg" /> : null}
          </DragOverlay>
        </DndContext>
      )}

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
