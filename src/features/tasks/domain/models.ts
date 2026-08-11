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

/** GET /tasks/board's shape: one array per column, `cancelled` never appears. */
export type TaskBoardColumns = Partial<Record<TaskStatus, Task[]>>;

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

/** No `parentId`, no `status` — see UpdateTaskDto on the backend for why. */
export type TaskPatch = Readonly<{
  title?: string;
  description?: Record<string, unknown>;
  kind?: TaskKind;
  priority?: TaskPriority;
  reporterId?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  blockedReason?: string | null;
  attachments?: string[];
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

export type TaskEntityLink = Readonly<{ entityKind: TaskEntityKind; entityId: number }>;

/** Query filters behind GET /tasks — every field is an AND with the rest. */
export type TaskFilters = Readonly<{
  status?: TaskStatus;
  assigneeUserId?: number;
  kind?: TaskKind;
  priority?: TaskPriority;
  labelId?: number;
  entityKind?: TaskEntityKind;
  entityId?: number;
  dueBefore?: string;
  includeSubtasks?: boolean;
  q?: string;
}>;

export type TaskLabelDraft = Readonly<{ name: string; color?: string }>;
export type TaskLabelPatch = Readonly<{ name?: string; color?: string }>;
