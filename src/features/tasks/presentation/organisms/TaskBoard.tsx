"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelectFilter, PageToolbarCard } from "@/components/shared";
import { cn } from "@/lib/utils";
import { todayInBusinessTimezone } from "@/shared/lib/businessDate";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";
import { useCurrentUser } from "@/shared/auth/CurrentUserProvider";
import { useUserDirectory } from "@/features/users/presentation/hooks/data/useUserDirectory";
import { BOARD_STATUSES, TASK_KINDS, TASK_PRIORITIES, TASK_STATUSES } from "@/tasks/domain";
import type { Task, TaskBoardColumns, TaskEntityKind, TaskKind, TaskPriority, TaskStatus } from "@/tasks/domain";
import { useInstantTasksBoard } from "../hooks/data/useInstantTasksBoard";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { TaskCard } from "../molecules/TaskCard";
import { AssigneeFilterDropdown } from "../molecules/AssigneeFilterDropdown";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { TaskEmptyState } from "../atoms/TaskEmptyState";
import { BlockedReasonDialog } from "../molecules/BlockedReasonDialog";
import {
  TASK_KIND_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
} from "../atoms/taskVisualTokens";
import { resolveCardDropSide, sameDragPreview, type TaskBoardDragPreview } from "./taskBoardDragUtil";
import { applyOptimisticMove } from "./taskBoardOptimisticMove";
import { matchesAssigneeFilter, type AssigneeFilterKey } from "./taskBoardAssigneeFilter";
import { groupTasksByAssignee } from "./taskBoardAssigneeGroups";
import { TASK_SEARCH_INPUT_ID } from "./TaskKeyboardShortcuts";
import { useTasksViewState } from "../hooks/useTasksViewState";
import { QuickAddTask } from "../molecules/QuickAddTask";
import { parseTaskQuickAdd } from "../molecules/taskQuickAdd";
import { useInstantTaskLabels } from "../hooks/data/useInstantTaskLabels";
import { TaskBulkActionBar } from "./TaskBulkActionBar";

const COLUMN_PREFIX = "column:";
const ASSIGNEE_PREFIX = "assignee:";
const GROUP_PREFIX = "group:";

type QuickFilter = "overdue" | "today" | "in_progress" | "blocked" | null;

const DATE_FORMAT = "yyyy-MM-dd";

const STATUS_OPTIONS = TASK_STATUSES.map((value) => ({
  value,
  label: TASK_STATUS_LABELS[value],
  color: TASK_STATUS_COLORS[value],
}));
const PRIORITY_OPTIONS = TASK_PRIORITIES.map((value) => ({ value, label: TASK_PRIORITY_LABELS[value] }));
const KIND_OPTIONS = TASK_KINDS.map((value) => ({ value, label: TASK_KIND_LABELS[value] }));

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
      aria-pressed={active}
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

function SortableTaskCard({ task, onClick, onComplete, onAssigneeClick, onDueDateClick, onDuplicate, onDelete, onPriorityChange, onLabelsClick, onSelect, selected }: { task: Task; onClick: () => void; onComplete?: () => void; onAssigneeClick?: () => void; onDueDateClick?: () => void; onDuplicate?: () => void; onDelete?: () => void; onPriorityChange?: (priority: TaskPriority) => void; onLabelsClick?: () => void; onSelect?: (shiftKey: boolean) => void; selected?: boolean }) {
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
      <TaskCard task={task} onClick={onClick} onComplete={onComplete} onAssigneeClick={onAssigneeClick} onDueDateClick={onDueDateClick} onDuplicate={onDuplicate} onDelete={onDelete} onPriorityChange={onPriorityChange} onLabelsClick={onLabelsClick} onSelect={onSelect} selected={selected} />
    </div>
  );
}

function BoardColumn({
  status,
  tasks,
  totalCount,
  onCardClick,
  onQuickAdd,
  onComplete,
  onDuplicate,
  onDelete,
  onPriorityChange,
  selectedIds,
  onSelect,
}: {
  status: TaskStatus;
  tasks: Task[];
  /** Only set (and only ever exceeding tasks.length) for `done` — see TaskBoard. */
  totalCount?: number;
  onCardClick: (id: number) => void;
  onQuickAdd: (value: string) => Promise<void>;
  onComplete: (task: Task) => void;
  onDuplicate: (task: Task) => void;
  onDelete: (task: Task) => void;
  onPriorityChange: (task: Task, priority: TaskPriority) => void;
  selectedIds: Set<number>;
  onSelect: (taskId: number, shiftKey: boolean) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${COLUMN_PREFIX}${status}` });
  const hasMoreThanShown = totalCount != null && totalCount > tasks.length;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border border-border bg-card transition-colors",
        isOver && "border-primary/50 bg-primary/5"
      )}
    >
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-2.5">
        <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TASK_STATUS_COLORS[status] }} aria-hidden="true" />
          {TASK_STATUS_LABELS[status]}
        </span>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
          {hasMoreThanShown ? `${tasks.length} of ${totalCount}` : tasks.length}
        </span>
      </div>
      <div className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto p-2">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onCardClick(task.id)}
              onComplete={() => onComplete(task)}
              onAssigneeClick={() => onCardClick(task.id)}
              onDueDateClick={() => onCardClick(task.id)}
              onDuplicate={() => onDuplicate(task)}
              onDelete={() => onDelete(task)}
              onPriorityChange={(priority) => onPriorityChange(task, priority)}
              onLabelsClick={() => onCardClick(task.id)}
              onSelect={(shiftKey) => onSelect(task.id, shiftKey)}
              selected={selectedIds.has(task.id)}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 ? <TaskEmptyState compact title="No tasks" /> : null}
      </div>
      <QuickAddTask onAdd={onQuickAdd} />
      {hasMoreThanShown ? (
        // Only the most recent DONE_LIMIT/DONE_WINDOW_DAYS worth of completed tasks
        // load onto the board at all (see the backend's TasksRepository.findForBoard)
        // — the rest are one click away in the list, not silently missing.
        <Link
          href="/tasks?view=list&status=done"
          className="border-t border-border/40 px-3 py-2 text-center text-[11px] font-medium text-primary hover:underline"
        >
          View all {totalCount} completed
        </Link>
      ) : null}
    </div>
  );
}

/**
 * One row per assignee. Dropping a card on another row changes only its assignee;
 * the current status remains visible in the row's status buckets.
 */
function AssigneeSwimlane({
  group,
  onCardClick,
  onComplete,
  onDuplicate,
  onDelete,
  onPriorityChange,
  isDropPreview,
  previewTask,
  onQuickAdd,
  selectedIds,
  onSelect,
}: {
  group: ReturnType<typeof groupTasksByAssignee>[number];
  onCardClick: (id: number) => void;
  onComplete: (task: Task) => void;
  onDuplicate: (task: Task) => void;
  onDelete: (task: Task) => void;
  onPriorityChange: (task: Task, priority: TaskPriority) => void;
  isDropPreview?: boolean;
  previewTask?: Task | null;
  onQuickAdd: (value: string) => Promise<void>;
  selectedIds: Set<number>;
  onSelect: (taskId: number, shiftKey: boolean) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${ASSIGNEE_PREFIX}${group.key}` });
  const groupTaskIds = BOARD_STATUSES.flatMap((status) => (group.columns[status] ?? []).map((task) => task.id));
  return (
    <div ref={setNodeRef} className={cn("flex flex-col gap-2 rounded-xl border border-border bg-card p-3", (isOver || isDropPreview) && "border-primary/50 bg-primary/5")}>
      <div className="flex items-center gap-2">
        <AssigneeAvatar person={group.person} size="md" />
        <span className="text-sm font-medium text-foreground">
          {group.person ? (group.person.name ?? group.person.email) : "Unassigned"}
        </span>
        <span className="rounded-full bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
           {group.total}
         </span>
        {isDropPreview ? <span className="ml-auto text-[10px] font-medium text-primary">Drop here</span> : null}
      </div>
      <SortableContext items={groupTaskIds} strategy={verticalListSortingStrategy}>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {BOARD_STATUSES.map((status) => {
            const tasks = group.columns[status] ?? [];
            return (
              <div
                key={status}
              className="flex w-56 shrink-0 flex-col gap-2 rounded-lg border border-border bg-card p-2"
              >
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold tracking-wide text-muted-foreground">
                    {TASK_STATUS_LABELS[status]}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{tasks.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {previewTask && status === previewTask.status ? <TaskCard task={previewTask} className="border-dashed opacity-60" /> : null}
                  {tasks.map((task) => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onClick={() => onCardClick(task.id)}
                      onComplete={() => onComplete(task)}
                      onAssigneeClick={() => onCardClick(task.id)}
                      onDueDateClick={() => onCardClick(task.id)}
                      onDuplicate={() => onDuplicate(task)}
                      onDelete={() => onDelete(task)}
                      onPriorityChange={(priority) => onPriorityChange(task, priority)}
                      onLabelsClick={() => onCardClick(task.id)}
                      onSelect={(shiftKey) => onSelect(task.id, shiftKey)}
                      selected={selectedIds.has(task.id)}
                    />
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
      </SortableContext>
      <QuickAddTask onAdd={onQuickAdd} />
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

function GenericGroupLane({ group, children, isDropPreview = false, previewTask, onQuickAdd }: { group: { key: string; label: string; tasks: Task[] }; children: ReactNode; isDropPreview?: boolean; previewTask?: Task | null; onQuickAdd: (value: string) => Promise<void> }) {
  const { setNodeRef, isOver } = useDroppable({ id: `${GROUP_PREFIX}${group.key}` });
  return (
    <div ref={setNodeRef} className={cn("rounded-xl border border-border bg-card p-3", (isOver || isDropPreview) && "border-primary/60 bg-primary/5")}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium capitalize">{group.label}</span>
        <span className="flex items-center gap-2">
          {isDropPreview ? <span className="text-[10px] font-medium text-primary">Drop here</span> : null}
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{group.tasks.length}</span>
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {previewTask ? <TaskCard task={previewTask} className="border-dashed opacity-60" /> : null}
        {children}
      </div>
      <QuickAddTask onAdd={onQuickAdd} />
    </div>
  );
}

export function TaskBoard({
  onOpenTask,
  embeddedTasks,
  embeddedEntity,
}: {
  onOpenTask: (id: number) => void;
  embeddedTasks?: Task[];
  embeddedEntity?: { entityKind?: TaskEntityKind; entityId?: number; partyKind?: "company" | "contact"; partyId?: number };
}) {
  const { state, filters, replaceState } = useTasksViewState();
  const { board: fetchedBoard, doneTotalCount: fetchedDoneTotalCount, showSkeleton: fetchedShowSkeleton } = useInstantTasksBoard(filters);
  const board = useMemo<TaskBoardColumns>(() => {
    if (!embeddedTasks) return fetchedBoard;
    const columns: TaskBoardColumns = {};
    for (const status of BOARD_STATUSES) columns[status] = embeddedTasks.filter((task) => !task.parentId && task.status === status);
    return columns;
  }, [embeddedTasks, fetchedBoard]);
  const doneTotalCount = embeddedTasks ? (board.done?.length ?? 0) : fetchedDoneTotalCount;
  const showSkeleton = embeddedTasks ? false : fetchedShowSkeleton;
  const { createMutation, moveMutation, setAssigneeMutation, setLabelsMutation, updateMutation, setEntityMutation, deleteMutation } = useTaskMutations();
  const { labels: taskLabels } = useInstantTaskLabels();
  const { user } = useCurrentUser();
  // Always on (not gated behind a picker opening) — the assignee filter and the
  // swimlane view both need names/avatars up front, not just once someone clicks in.
  const assigneeFilter = useMemo(() => new Set<AssigneeFilterKey>(state.assignee), [state.assignee]);
  const groupByAssignee = state.group === "assignee";
  const quickFilter: QuickFilter =
    state.due === "overdue" || state.due === "today"
      ? state.due
      : state.status.length === 1 && (state.status[0] === "in_progress" || state.status[0] === "blocked")
        ? state.status[0]
        : null;
  const { users: directoryUsers } = useUserDirectory(true);

  const [pendingBlock, setPendingBlock] = useState<{
    taskId: number;
    beforeId?: number;
    afterId?: number;
  } | null>(null);
  const [searchDraft, setSearchDraft] = useState(state.q);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<number | null>(null);
  useEffect(() => setSearchDraft(state.q), [state.q]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchDraft !== state.q) replaceState({ q: searchDraft });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [replaceState, searchDraft, state.q]);

  // Which card is being dragged (for DragOverlay) and where it would land if dropped
  // right now (for the live reorder preview) — both reset on drop or cancel. Neither
  // touches the query cache; that only happens on a real drop (see
  // taskBoardOptimisticMove, wired in useTaskMutations' moveMutation).
  const [activeId, setActiveId] = useState<number | null>(null);
  const [dragPreview, setDragPreview] = useState<TaskBoardDragPreview | null>(null);
  const [groupDragPreview, setGroupDragPreview] = useState<string | null>(null);

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

  // Search is applied by the server; this pass keeps the board derived from the
  // pristine query result so drag previews never compound over filtered data.
  const searched = useMemo(() => {
    const result: Partial<Record<TaskStatus, Task[]>> = {};
    for (const status of BOARD_STATUSES) {
      const tasks = displayBoard[status] ?? [];
      result[status] = tasks;
    }
    return result;
  }, [displayBoard]);

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

  const toggleQuickFilter = (value: Exclude<QuickFilter, null>) => {
    if (value === "overdue" || value === "today") {
      replaceState({ due: state.due === value ? null : value });
      return;
    }
    const next = state.status.includes(value)
      ? state.status.filter((status) => status !== value)
      : [...state.status, value];
    replaceState({ status: next });
  };

  const onlyMineActive = user != null && assigneeFilter.size === 1 && assigneeFilter.has(user.id);
  const toggleOnlyMine = () => {
    if (!user) return;
    replaceState({ assignee: onlyMineActive ? [] : [user.id] });
  };

  const assigneeGroups = useMemo(
    () => (groupByAssignee ? groupTasksByAssignee(filteredBoard) : []),
    [groupByAssignee, filteredBoard]
  );

  const flatFilteredTasks = useMemo(
    () => BOARD_STATUSES.flatMap((status) => filteredBoard[status] ?? []),
    [filteredBoard],
  );

  const selectTask = (taskId: number, shiftKey: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (shiftKey && lastSelectedId != null) {
        const start = flatFilteredTasks.findIndex((task) => task.id === lastSelectedId);
        const end = flatFilteredTasks.findIndex((task) => task.id === taskId);
        if (start >= 0 && end >= 0) {
          for (const task of flatFilteredTasks.slice(Math.min(start, end), Math.max(start, end) + 1)) next.add(task.id);
        }
      } else if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
    setLastSelectedId(taskId);
  };
  const openBoardTask = (taskId: number) => {
    setLastSelectedId(taskId);
    onOpenTask(taskId);
  };
  const genericGroups = useMemo(() => {
    if (state.group === "assignee" || state.group === "status") return [] as Array<{ key: string; label: string; tasks: Task[] }>;
    const groups = new Map<string, { key: string; label: string; tasks: Task[] }>();
    for (const task of flatFilteredTasks) {
      const key = state.group === "job"
        ? task.entity?.jobKey ? `job:${task.entity.jobKey}` : task.entity?.id != null ? `job:${task.entity.kind}:${task.entity.id}` : "job:none"
        : task.kind;
      const label = state.group === "job"
        ? task.entity?.label ?? "No linked job"
        : task.kind.replaceAll("_", " ");
      const group = groups.get(key) ?? { key, label, tasks: [] };
      group.tasks.push(task);
      groups.set(key, group);
    }
    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [flatFilteredTasks, state.group]);

  const resolveTargetStatus = (overId: string | number): TaskStatus | null => {
    if (typeof overId === "string" && overId.startsWith(ASSIGNEE_PREFIX)) {
      return taskStatusById.get(activeId ?? -1) ?? null;
    }
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

  const quickAddToColumn = async (status: TaskStatus, value: string) => {
    const parsed = parseTaskQuickAdd(value);
    const assigneeToken = parsed.assigneeToken;
    const assignee = assigneeToken
      ? directoryUsers.find((person) => person.id === Number(assigneeToken) || person.name?.toLowerCase() === assigneeToken.toLowerCase() || person.email.toLowerCase().startsWith(assigneeToken.toLowerCase()))
      : undefined;
    const labels = taskLabels.filter((label) => parsed.labelTokens.some((token) => label.name.toLowerCase() === token.toLowerCase()));
    const created = await createMutation.mutateAsync({
      title: parsed.title,
      priority: parsed.priority,
      dueDate: parsed.dueDate,
      assigneeUserId: assignee?.id,
      entityKind: embeddedEntity?.entityKind ?? (state.job != null ? "lead" : undefined),
      entityId: embeddedEntity?.entityId ?? state.job ?? undefined,
      parties: embeddedEntity?.partyKind && embeddedEntity.partyId != null
        ? [{ partyKind: embeddedEntity.partyKind, partyId: embeddedEntity.partyId }]
        : undefined,
    });
    if (labels.length) await setLabelsMutation.mutateAsync({ id: created.id, labelIds: labels.map((label) => label.id) });
    if (status !== "todo") {
      await moveMutation.mutateAsync({
        id: created.id,
        input: { status, blockedReason: status === "blocked" ? "Added to blocked column" : undefined },
      });
    }
  };

  const quickAddToGroup = async (group: { key: string | number }, value: string) => {
    const parsed = parseTaskQuickAdd(value);
    const assigneeToken = parsed.assigneeToken;
    const groupKey = String(group.key);
    const assignee = assigneeToken
      ? directoryUsers.find((person) => person.id === Number(assigneeToken) || person.name?.toLowerCase() === assigneeToken.toLowerCase() || person.email.toLowerCase().startsWith(assigneeToken.toLowerCase()))
      : undefined;
    let entityKind = embeddedEntity?.entityKind ?? (state.job != null ? "lead" : undefined) as TaskEntityKind | undefined;
    let entityId = embeddedEntity?.entityId ?? state.job ?? undefined;
    let assigneeUserId = assignee?.id;
    if (state.group === "assignee") {
      assigneeUserId = groupKey === "unassigned" ? undefined : Number(groupKey);
    } else if (state.group === "kind") {
      // The kind is supplied by the group lane below.
    } else if (state.group === "job") {
      const match = groupKey.match(/^job:(lead|project|contact|company):(\d+)$/);
      entityKind = match?.[1] as TaskEntityKind | undefined;
      entityId = match ? Number(match[2]) : undefined;
    }
    const created = await createMutation.mutateAsync({
      title: parsed.title,
      kind: state.group === "kind" ? groupKey as TaskKind : undefined,
      priority: parsed.priority,
      dueDate: parsed.dueDate,
      assigneeUserId,
      entityKind,
      entityId,
      parties: embeddedEntity?.partyKind && embeddedEntity.partyId != null
        ? [{ partyKind: embeddedEntity.partyKind, partyId: embeddedEntity.partyId }]
        : undefined,
    });
    const labels = taskLabels.filter((label) => parsed.labelTokens.some((token) => label.name.toLowerCase() === token.toLowerCase()));
    if (labels.length) await setLabelsMutation.mutateAsync({ id: created.id, labelIds: labels.map((label) => label.id) });
  };

  const completeTask = (task: Task) => {
    if (task.status !== "done") commitMove(task.id, "done");
  };

  const duplicateTask = async (task: Task) => {
    await createMutation.mutateAsync({ title: `${task.title} (copy)`, kind: task.kind, priority: task.priority, assigneeUserId: task.assignee?.id, entityKind: task.entityKind ?? undefined, entityId: task.entityId ?? undefined, dueDate: task.dueDate ?? undefined });
  };
  const deleteTask = (task: Task) => deleteMutation.mutate(task.id);

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
    if (state.group !== "status") {
      setDragPreview(null);
      const target = taskById.get(Number(over.id));
      const targetKey = typeof over.id === "string" && over.id.startsWith(ASSIGNEE_PREFIX)
        ? over.id.slice(ASSIGNEE_PREFIX.length)
        : typeof over.id === "string" && over.id.startsWith(GROUP_PREFIX)
          ? over.id.slice(GROUP_PREFIX.length)
          : target
            ? state.group === "kind"
              ? target.kind
              : target.entity?.jobKey
                ? `job:${target.entity.jobKey}`
                : target.entity?.id != null
                  ? `job:${target.entity.kind}:${target.entity.id}`
                  : "job:none"
            : null;
      setGroupDragPreview(targetKey);
      return;
    }
    setGroupDragPreview(null);
    const targetStatus = resolveTargetStatus(over.id);
    if (!targetStatus) {
      setDragPreview(null);
      return;
    }

    const { beforeId, afterId } = resolveDropTarget(taskId, targetStatus, over.id);
    const nextPreview: TaskBoardDragPreview = { taskId, toStatus: targetStatus, beforeId, afterId };
    setDragPreview((current) => (sameDragPreview(current, nextPreview) ? current : nextPreview));
  };

  const resetDragState = () => {
    setActiveId(null);
    setDragPreview(null);
    setGroupDragPreview(null);
  };

  const handleDragCancel = () => {
    resetDragState();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    resetDragState();
    if (!over) return;

    const taskId = Number(active.id);
    if (state.group === "assignee") {
      const source = taskById.get(taskId);
      if (!source) return;
      const overTask = typeof over.id === "string" && over.id.startsWith(ASSIGNEE_PREFIX)
        ? undefined
        : taskById.get(Number(over.id));
      const targetKey: AssigneeFilterKey | null = typeof over.id === "string" && over.id.startsWith(ASSIGNEE_PREFIX)
        ? (over.id.slice(ASSIGNEE_PREFIX.length) === "unassigned"
          ? "unassigned"
          : Number(over.id.slice(ASSIGNEE_PREFIX.length)))
        : overTask?.assignee?.id ?? "unassigned";
      const currentKey: AssigneeFilterKey = source.assignee?.id ?? "unassigned";
      if (targetKey !== currentKey && (typeof targetKey === "number" || targetKey === "unassigned")) {
        setAssigneeMutation.mutate({ id: taskId, userId: targetKey === "unassigned" ? null : targetKey });
      }
      return;
    }
    if (state.group === "kind" || state.group === "job") {
      const source = taskById.get(taskId);
      if (!source) return;
      const overTask = typeof over.id === "string" && over.id.startsWith(GROUP_PREFIX) ? undefined : taskById.get(Number(over.id));
      const targetKey = typeof over.id === "string" && over.id.startsWith(GROUP_PREFIX)
        ? over.id.slice(GROUP_PREFIX.length)
        : overTask
          ? state.group === "kind"
            ? overTask.kind
            : overTask.entity?.jobKey ? `job:${overTask.entity.jobKey}` : overTask.entity?.id != null ? `job:${overTask.entity.kind}:${overTask.entity.id}` : "job:none"
          : null;
      if (!targetKey) return;
      if (state.group === "kind" && targetKey !== source.kind) {
        updateMutation.mutate({ id: taskId, patch: { kind: targetKey as TaskKind } });
      } else if (state.group === "job") {
        const match = targetKey.match(/^job:(lead|project|contact|company):(\d+)$/);
        if (match) setEntityMutation.mutate({ id: taskId, link: { entityKind: match[1] as TaskEntityKind, entityId: Number(match[2]) } });
        else if (targetKey === "job:none") setEntityMutation.mutate({ id: taskId, link: null });
      }
      return;
    }
    if (state.group !== "status") return;
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
              onClick={() => setSearchDraft("")}
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
            onChange={(next) =>
              replaceState({
                assignee: Array.from(next).filter(
                  (key): key is number => typeof key === "number",
                ),
              })
            }
          />
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
        <div className="w-40 shrink-0">
          <MultiSelectFilter
            placeholder="All labels"
            options={taskLabels.map((label) => ({ value: String(label.id), label: label.name }))}
            selected={new Set(state.label.map(String))}
            onChange={(value) => replaceState({ label: Array.from(value).map(Number).filter(Number.isFinite) })}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Rows3 className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={state.group} onValueChange={(value) => replaceState({ group: value as typeof state.group })}>
            <SelectTrigger className="h-9 w-36 border-border/60 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Group by status</SelectItem>
              <SelectItem value="assignee">Group by assignee</SelectItem>
              <SelectItem value="job">Group by job</SelectItem>
              <SelectItem value="kind">Group by kind</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageToolbarCard>

      <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          accessibility={{ announcements }}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {state.group === "status" ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {BOARD_STATUSES.map((status) => (
                <BoardColumn
                  key={status}
                  status={status}
                  tasks={filteredBoard[status] ?? []}
                  totalCount={status === "done" ? doneTotalCount : undefined}
                  onCardClick={openBoardTask}
                  onQuickAdd={(value) => quickAddToColumn(status, value)}
                  onComplete={completeTask}
                  onDuplicate={duplicateTask}
                  onDelete={deleteTask}
                  onPriorityChange={(task, priority) => updateMutation.mutate({ id: task.id, patch: { priority } })}
                  selectedIds={selectedIds}
                  onSelect={selectTask}
                />
              ))}
            </div>
          ) : groupByAssignee ? (
            <div className="flex flex-col gap-3">
              {assigneeGroups.length === 0 ? (
                <TaskEmptyState title="No tasks match the current filters." className="py-10" />
              ) : assigneeGroups.map((group) => (
                <AssigneeSwimlane key={group.key} group={group} onCardClick={openBoardTask} onComplete={completeTask} onDuplicate={duplicateTask} onDelete={deleteTask} onPriorityChange={(task, priority) => updateMutation.mutate({ id: task.id, patch: { priority } })} isDropPreview={groupDragPreview === group.key} previewTask={groupDragPreview === group.key ? activeTask : null} onQuickAdd={(value) => quickAddToGroup(group, value)} selectedIds={selectedIds} onSelect={selectTask} />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {genericGroups.length === 0 ? <TaskEmptyState title="No tasks match the current filters." className="py-10" /> : null}
              {genericGroups.map((group) => (
                <GenericGroupLane key={group.key} group={group} isDropPreview={groupDragPreview === group.key} previewTask={groupDragPreview === group.key ? activeTask : null} onQuickAdd={(value) => quickAddToGroup(group, value)}>
                     {group.tasks.map((task) => (
                       <SortableTaskCard key={task.id} task={task} onClick={() => openBoardTask(task.id)} onComplete={() => completeTask(task)} onAssigneeClick={() => openBoardTask(task.id)} onDueDateClick={() => openBoardTask(task.id)} onDuplicate={() => void duplicateTask(task)} onDelete={() => deleteTask(task)} onPriorityChange={(priority) => updateMutation.mutate({ id: task.id, patch: { priority } })} onLabelsClick={() => openBoardTask(task.id)} onSelect={(shiftKey) => selectTask(task.id, shiftKey)} selected={selectedIds.has(task.id)} />
                     ))}
                </GenericGroupLane>
              ))}
            </div>
          )}
          <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
            {activeTask ? <TaskCard task={activeTask} className="shadow-lg" /> : null}
          </DragOverlay>
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
      <TaskBulkActionBar selectedIds={selectedIds} onClear={() => setSelectedIds(new Set())} />
    </div>
  );
}
