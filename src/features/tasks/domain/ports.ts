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
  TaskRescheduleInput,
  TaskReorderInput,
  TaskMoveResult,
  TaskPatch,
  TaskStatus,
  TaskScheduleFilters,
  TaskTemplate,
  TaskSavedView,
} from "./models";

export interface TasksRepositoryPort {
  list(filters?: TaskFilters): Promise<TaskListResult>;
  listArchived(): Promise<Task[]>;
  getBoard(filters?: TaskFilters): Promise<TaskBoardResult>;
  /** overdue / today / thisWeek / later / noDueDate, in the business's timezone. */
  getMine(): Promise<Record<string, Task[]>>;
  schedule(filters: TaskScheduleFilters): Promise<Task[]>;
  listTemplates(): Promise<TaskTemplate[]>;
  applyTemplate(templateId: number, leadId: number, startDate?: string): Promise<TaskDetail[]>;
  listSavedViews(): Promise<TaskSavedView[]>;
  createSavedView(name: string, state: Record<string, unknown>, shared?: boolean): Promise<TaskSavedView>;
  deleteSavedView(id: number): Promise<void>;
  listByEntity(entityKind: string, entityId: number): Promise<Task[]>;
  listByParty(partyKind: "company" | "contact", partyId: number): Promise<Task[]>;
  get(id: number): Promise<TaskDetail>;

  create(draft: TaskDraft): Promise<TaskDetail>;
  update(id: number, patch: TaskPatch): Promise<TaskDetail>;
  move(id: number, input: TaskMoveInput): Promise<TaskMoveResult>;
  reschedule(id: number, input: TaskRescheduleInput): Promise<TaskDetail>;
  /** Reorders a subtask among its parent's children; resolves to the parent's detail. */
  reorderSubtask(id: number, input: TaskReorderInput): Promise<TaskDetail>;
  setAssignee(id: number, userId: number | null): Promise<TaskDetail>;
  setLabels(id: number, labelIds: number[]): Promise<TaskDetail>;
  setEntityLink(id: number, link: TaskEntityLink | null): Promise<TaskDetail>;
  setParties(
    id: number,
    parties: Array<{ partyKind: "company" | "contact"; partyId: number; role?: string }>
  ): Promise<Array<{ partyKind: "company" | "contact"; partyId: number; role: string }>>;
  listWatchers(id: number): Promise<number[]>;
  addWatcher(id: number, userId: number): Promise<number[]>;
  removeWatcher(id: number, userId: number): Promise<number[]>;
  archive(id: number): Promise<void>;
  restore(id: number): Promise<TaskDetail>;
  listDependencies(id: number): Promise<number[]>;
  setDependencies(id: number, dependsOnTaskIds: number[]): Promise<number[]>;
  startTimer(id: number): Promise<TaskDetail>;
  stopTimer(id: number): Promise<TaskDetail>;
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
