import type {
  Task,
  TaskBoardResult,
  TaskBulkResult,
  TaskComment,
  TaskDetail,
  TaskDraft,
  TaskEntityLink,
  TaskFilters,
  TaskLabel,
  TaskLabelDraft,
  TaskLabelPatch,
  TaskListResult,
  TaskMoveInput,
  TaskMoveResult,
  TaskPatch,
  TaskStatus,
} from "./models";

export interface TasksRepositoryPort {
  list(filters?: TaskFilters): Promise<TaskListResult>;
  getBoard(): Promise<TaskBoardResult>;
  /** overdue / today / thisWeek / later / noDueDate, in the business's timezone. */
  getMine(): Promise<Record<string, Task[]>>;
  listByEntity(entityKind: string, entityId: number): Promise<Task[]>;
  get(id: number): Promise<TaskDetail>;

  create(draft: TaskDraft): Promise<TaskDetail>;
  update(id: number, patch: TaskPatch): Promise<TaskDetail>;
  move(id: number, input: TaskMoveInput): Promise<TaskMoveResult>;
  setAssignee(id: number, userId: number | null): Promise<TaskDetail>;
  setLabels(id: number, labelIds: number[]): Promise<TaskDetail>;
  setEntityLink(id: number, link: TaskEntityLink | null): Promise<TaskDetail>;
  delete(id: number): Promise<void>;

  /** Additive — see TaskPatch for why attachments never travel through update(). */
  addAttachments(id: number, keys: string[]): Promise<TaskDetail>;
  removeAttachment(id: number, key: string): Promise<TaskDetail>;
  reorderAttachments(id: number, keys: string[]): Promise<TaskDetail>;

  /** Comments also arrive bundled in `get()`'s TaskDetail — these exist for the mutations. */
  listComments(taskId: number): Promise<TaskComment[]>;
  addComment(taskId: number, body: Record<string, unknown>): Promise<TaskComment>;
  updateComment(
    taskId: number,
    commentId: number,
    body: Record<string, unknown>
  ): Promise<TaskComment>;
  deleteComment(taskId: number, commentId: number): Promise<void>;

  /** The list's multi-select toolbar — each runs every task independently server-side, see TaskBulkResult. */
  bulkSetAssignee(taskIds: number[], userId: number | null): Promise<TaskBulkResult>;
  bulkSetStatus(taskIds: number[], status: TaskStatus, blockedReason?: string): Promise<TaskBulkResult>;
  bulkAddLabels(taskIds: number[], labelIds: number[]): Promise<TaskBulkResult>;
  bulkDelete(taskIds: number[]): Promise<TaskBulkResult>;
}

export interface TaskLabelsRepositoryPort {
  list(): Promise<TaskLabel[]>;
  create(draft: TaskLabelDraft): Promise<TaskLabel>;
  update(id: number, patch: TaskLabelPatch): Promise<TaskLabel>;
  delete(id: number): Promise<void>;
}
