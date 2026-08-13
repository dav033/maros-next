import type {
  Task,
  TaskBoardColumns,
  TaskComment,
  TaskDetail,
  TaskDraft,
  TaskEntityLink,
  TaskFilters,
  TaskLabel,
  TaskLabelDraft,
  TaskLabelPatch,
  TaskMoveInput,
  TaskMoveResult,
  TaskPatch,
} from "./models";

export interface TasksRepositoryPort {
  list(filters?: TaskFilters): Promise<Task[]>;
  getBoard(): Promise<TaskBoardColumns>;
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
}

export interface TaskLabelsRepositoryPort {
  list(): Promise<TaskLabel[]>;
  create(draft: TaskLabelDraft): Promise<TaskLabel>;
  update(id: number, patch: TaskLabelPatch): Promise<TaskLabel>;
  delete(id: number): Promise<void>;
}
