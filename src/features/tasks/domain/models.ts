export const TASK_KINDS = [
  "site_visit",
  "estimate",
  "follow_up",
  "permit",
  "inspection",
  "material_order",
  "subcontractor",
  "punch_list",
  "change_order",
  "warranty",
  "safety",
  "general",
] as const;
export type TaskKind = (typeof TASK_KINDS)[number];

/** `cancelled` is deliberately left off the board — see TaskBoard. It only shows in the list. */
export const TASK_STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "blocked",
  "done",
  "cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Statuses the kanban board renders as columns. */
export const BOARD_STATUSES = TASK_STATUSES.filter((s) => s !== "cancelled");

export const TASK_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_ENTITY_KINDS = ["lead", "project", "contact", "company"] as const;
export type TaskEntityKind = (typeof TASK_ENTITY_KINDS)[number];

export type TaskActivityKind =
  | "created"
  | "status_changed"
  | "assigned"
  | "unassigned"
  | "due_changed"
  | "priority_changed"
  | "blocked"
  | "unblocked"
  | "commented"
  | "entity_linked"
  | "entity_unlinked"
  | "attachment_added"
  | "subtask_added";

/** Assignee, reporter, createdBy and activity actor all come back in this shape. */
export interface TaskPersonRef {
  id: number;
  name: string | null;
  email: string;
  picture: string | null;
}

export interface TaskLabel {
  id: number;
  name: string;
  color: string;
}

export interface TaskActivityEntry {
  id: number;
  kind: TaskActivityKind;
  fromValue: string | null;
  toValue: string | null;
  actor: TaskPersonRef | null;
  createdAt: string;
}

export interface TaskComment {
  id: number;
  taskId: number;
  body: Record<string, unknown>;
  author: TaskPersonRef | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * The linked CRM record, resolved server-side (TaskEntityResolverService) — a name to
 * show instead of the bare `entityKind`/`entityId` pair, plus whatever address the
 * record carries. `null` when the task isn't linked, or when the linked record was
 * deleted out from under it (entityKind/entityId still point at it, but nothing
 * resolves).
 */
export interface TaskEntityRef {
  kind: TaskEntityKind;
  id: number;
  label: string;
  href: string;
  leadNumber?: string;
  address?: string;
  addressLink?: string;
  status?: string;
}

/** The board/list row shape — no description, no subtasks, no activity. */
export interface Task {
  id: number;
  parentId: number | null;
  title: string;
  kind: TaskKind;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  assignee: TaskPersonRef | null;
  reporter: TaskPersonRef | null;
  entityKind: TaskEntityKind | null;
  entityId: number | null;
  /** Resolved from entityKind/entityId — see TaskEntityRef. */
  entity: TaskEntityRef | null;
  startDate: string | null;
  dueDate: string | null;
  blockedReason: string | null;
  completedAt: string | null;
  labels: TaskLabel[];
  /** Direct-child subtask progress and comment count — 0 unless the backend counted them for this read. */
  subtasksTotal: number;
  subtasksDone: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

/** The detail sheet's shape — everything a summary row has, plus the rest. */
export interface TaskDetail extends Task {
  description: Record<string, unknown>;
  createdBy: TaskPersonRef | null;
  attachments: string[];
  subtasks: Task[];
  activity: TaskActivityEntry[];
  comments: TaskComment[];
}

/** One array per column, `cancelled` never appears. */
export type TaskBoardColumns = Partial<Record<TaskStatus, Task[]>>;

/**
 * GET /tasks/board's shape. `columns.done` is windowed to a recent slice (see the
 * backend's TasksRepository.findForBoard) — `doneTotalCount` is the true count behind
 * it, for a "view all completed" link once the two numbers diverge.
 */
export interface TaskBoardResult {
  columns: TaskBoardColumns;
  doneTotalCount: number;
}

/**
 * GET /tasks's shape. `items` is capped server-side (see the backend's
 * TasksRepository.LIST_LIMIT) — `totalCount` is the true count behind that cap, for a
 * "showing N of M, narrow with a filter to see the rest" hint once they diverge.
 */
export interface TaskListResult {
  items: Task[];
  totalCount: number;
}

export type TaskDraft = Readonly<{
  title?: string;
  description?: Record<string, unknown>;
  kind?: TaskKind;
  priority?: TaskPriority;
  parentId?: number;
  assigneeUserId?: number;
  reporterId?: number;
  entityKind?: TaskEntityKind;
  entityId?: number;
  startDate?: string;
  dueDate?: string;
}>;

/**
 * No `parentId`, no `status` — see UpdateTaskDto on the backend for why. No
 * `attachments` either: two browsers editing the same task each hold their own
 * (possibly stale) copy of the list, and a "send the whole array back" patch would let
 * the second save silently erase the first upload — see addTaskAttachments /
 * removeTaskAttachment / reorderTaskAttachments instead.
 */
export type TaskPatch = Readonly<{
  title?: string;
  description?: Record<string, unknown>;
  kind?: TaskKind;
  priority?: TaskPriority;
  reporterId?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  blockedReason?: string | null;
  /**
   * The task's `updatedAt` this edit was read from. When set, a save that lands after
   * someone else's concurrent edit fails with a "conflict" AppError instead of
   * silently overwriting it — see TaskDetailSheet's saveTaskPatch. Omit for callers
   * where the last write is meant to win.
   */
  expectedUpdatedAt?: string;
}>;

/**
 * The board's drag, and the detail view's status control — the only place a task's
 * status changes. `blockedReason` is required the first time a task enters `blocked`
 * unless it already carries one from before.
 */
export type TaskMoveInput = Readonly<{
  status: TaskStatus;
  beforeId?: number | null;
  afterId?: number | null;
  blockedReason?: string;
}>;

/** `openSubtasksWarning` is only ever present when a move closes a task with open subtasks. */
export type TaskMoveResult = Task & { openSubtasksWarning?: number };

/**
 * Reordering a subtask within its parent. Deliberately not TaskMoveInput: a subtask
 * has no board column, so there is no status to send — only where it sits among its
 * siblings. Omitting both ids sends it to the end.
 */
export type TaskReorderInput = Readonly<{
  beforeId?: number | null;
  afterId?: number | null;
}>;

export type TaskEntityLink = Readonly<{ entityKind: TaskEntityKind; entityId: number }>;

/** Multi-valued fields OR together (any match); every field is AND'd with the rest — see SearchTasksDto. */
export type TaskFilters = Readonly<{
  status?: TaskStatus[];
  assigneeUserId?: number[];
  kind?: TaskKind[];
  priority?: TaskPriority[];
  labelId?: number[];
  entityKind?: TaskEntityKind;
  entityId?: number;
  dueBefore?: string;
  includeSubtasks?: boolean;
  q?: string;
}>;

export type TaskLabelDraft = Readonly<{ name: string; color?: string }>;
export type TaskLabelPatch = Readonly<{ name?: string; color?: string }>;

/**
 * Every bulk action runs each task independently server-side and reports its own
 * outcome — one stale row or invalid transition in a 15-task selection doesn't fail
 * the other 14. See TasksService.runBulk on the backend.
 */
export interface TaskBulkResult {
  succeeded: number[];
  failed: Array<{ taskId: number; error: string }>;
}
