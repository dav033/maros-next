import type { HttpClientLike } from "@/shared/infra";
import { optimizedApiClient } from "@/shared/infra";
import type {
  Task,
  TaskBoardResult,
  TaskBulkResult,
  TaskComment,
  TaskDetail,
  TaskDraft,
  TaskEntityLink,
  TaskFilters,
  TaskListResult,
  TaskMoveInput,
  TaskRescheduleInput,
  TaskReorderInput,
  TaskMoveResult,
  TaskPatch,
  TasksRepositoryPort,
  TaskStatus,
  TaskScheduleFilters,
  TaskTemplate,
  TaskSavedView,
} from "@/features/tasks/domain";

import { endpoints } from "./endpoints";

/**
 * No DTO mapping here: TaskMapper on the backend already emits exactly this shape
 * (camelCase, same field names as the domain model), so there is nothing to translate —
 * same choice UsersHttpRepository made, unlike notes' heavier mappers.ts.
 */
export class TasksHttpRepository implements TasksRepositoryPort {
  constructor(private readonly api: HttpClientLike = optimizedApiClient) {}

  async list(filters?: TaskFilters): Promise<TaskListResult> {
    // .base directly: buildCrudEndpoints types `list` optional (it isn't, here, but
    // the type doesn't know that) — see NotePageHttpRepository.list for the same call.
    const { data } = await this.api.get<TaskListResult>(endpoints.base, {
      params: filters,
    });
    return data ?? { items: [], totalCount: 0, nextCursor: null };
  }

  async getBoard(filters?: TaskFilters): Promise<TaskBoardResult> {
    const { data } = await this.api.get<TaskBoardResult>(endpoints.board(), { params: filters });
    return data ?? { columns: {}, doneTotalCount: 0 };
  }

  async getMine(): Promise<Record<string, Task[]>> {
    const { data } = await this.api.get<Record<string, Task[]>>(endpoints.mine());
    return data ?? {};
  }

  async listByEntity(entityKind: string, entityId: number): Promise<Task[]> {
    const { data } = await this.api.get<Task[]>(endpoints.byEntity(), {
      params: { entityKind, entityId },
    });
    return Array.isArray(data) ? data : [];
  }

  async listArchived(): Promise<Task[]> {
    const { data } = await this.api.get<Task[]>(endpoints.archived());
    return Array.isArray(data) ? data : [];
  }

  async schedule(filters: TaskScheduleFilters): Promise<Task[]> {
    const { data } = await this.api.get<Task[]>(endpoints.schedule(), { params: filters });
    return Array.isArray(data) ? data : [];
  }

  async listTemplates(): Promise<TaskTemplate[]> {
    const { data } = await this.api.get<TaskTemplate[]>(endpoints.templates());
    return Array.isArray(data) ? data : [];
  }

  async applyTemplate(templateId: number, leadId: number, startDate?: string): Promise<TaskDetail[]> {
    const { data } = await this.api.post<TaskDetail[]>(endpoints.applyTemplate(templateId), { leadId, startDate });
    return Array.isArray(data) ? data : [];
  }

  async listSavedViews(): Promise<TaskSavedView[]> {
    const { data } = await this.api.get<TaskSavedView[]>(endpoints.savedViews());
    return Array.isArray(data) ? data : [];
  }

  async createSavedView(name: string, state: Record<string, unknown>, shared = false): Promise<TaskSavedView> {
    const { data } = await this.api.post<TaskSavedView>(endpoints.savedViews(), { name, state, shared });
    return data;
  }

  async deleteSavedView(id: number): Promise<void> {
    await this.api.delete<void>(endpoints.savedView(id));
  }

  async listByParty(partyKind: "company" | "contact", partyId: number): Promise<Task[]> {
    const { data } = await this.api.get<Task[]>(endpoints.byParty(), {
      params: { partyKind, partyId },
    });
    return Array.isArray(data) ? data : [];
  }

  async get(id: number): Promise<TaskDetail> {
    const { data } = await this.api.get<TaskDetail>(endpoints.getById(id));
    return data;
  }

  async create(draft: TaskDraft): Promise<TaskDetail> {
    const { data } = await this.api.post<TaskDetail>(endpoints.create(), draft);
    return data;
  }

  async update(id: number, patch: TaskPatch): Promise<TaskDetail> {
    const { data } = await this.api.patch<TaskDetail>(endpoints.update(id), patch);
    return data;
  }

  async move(id: number, input: TaskMoveInput): Promise<TaskMoveResult> {
    const { data } = await this.api.patch<TaskMoveResult>(endpoints.move(id), input);
    return data;
  }

  async reorderSubtask(id: number, input: TaskReorderInput): Promise<TaskDetail> {
    const { data } = await this.api.patch<TaskDetail>(endpoints.reorderSubtask(id), input);
    return data;
  }

  async setAssignee(id: number, userId: number | null): Promise<TaskDetail> {
    const { data } = await this.api.patch<TaskDetail>(endpoints.assignee(id), { userId });
    return data;
  }

  async setLabels(id: number, labelIds: number[]): Promise<TaskDetail> {
    const { data } = await this.api.put<TaskDetail>(endpoints.setLabels(id), { labelIds });
    return data;
  }

  async setEntityLink(id: number, link: TaskEntityLink | null): Promise<TaskDetail> {
    const { data } = await this.api.put<TaskDetail>(
      endpoints.entity(id),
      link ?? { entityKind: null, entityId: null },
    );
    return data;
  }

  async reschedule(id: number, input: TaskRescheduleInput): Promise<TaskDetail> {
    const { data } = await this.api.patch<TaskDetail>(endpoints.scheduleTask(id), input);
    return data;
  }

  async setParties(
    id: number,
    parties: Array<{ partyKind: "company" | "contact"; partyId: number; role?: string }>,
  ): Promise<Array<{ partyKind: "company" | "contact"; partyId: number; role: string }>> {
    const { data } = await this.api.put<Array<{ partyKind: "company" | "contact"; partyId: number; role: string }>>(
      endpoints.parties(id),
      { parties },
    );
    return data ?? [];
  }

  async listWatchers(id: number): Promise<number[]> {
    const { data } = await this.api.get<number[]>(endpoints.watchers(id));
    return data ?? [];
  }

  async addWatcher(id: number, userId: number): Promise<number[]> {
    const { data } = await this.api.post<number[]>(endpoints.watcher(id, userId), {});
    return data ?? [];
  }

  async removeWatcher(id: number, userId: number): Promise<number[]> {
    const { data } = await this.api.delete<number[]>(endpoints.watcher(id, userId));
    return data ?? [];
  }

  async archive(id: number): Promise<void> {
    await this.api.post<void>(endpoints.archive(id), {});
  }

  async restore(id: number): Promise<TaskDetail> {
    const { data } = await this.api.post<TaskDetail>(endpoints.restore(id), {});
    return data;
  }

  async listDependencies(id: number): Promise<number[]> {
    const { data } = await this.api.get<number[]>(endpoints.dependencies(id));
    return data ?? [];
  }

  async setDependencies(id: number, dependsOnTaskIds: number[]): Promise<number[]> {
    const { data } = await this.api.put<number[]>(endpoints.dependencies(id), { dependsOnTaskIds });
    return data ?? [];
  }

  async startTimer(id: number): Promise<TaskDetail> {
    const { data } = await this.api.post<TaskDetail>(endpoints.timerStart(id), {});
    return data;
  }

  async stopTimer(id: number): Promise<TaskDetail> {
    const { data } = await this.api.post<TaskDetail>(endpoints.timerStop(id), {});
    return data;
  }

  async delete(id: number): Promise<void> {
    await this.api.delete<void>(endpoints.remove(id));
  }

  async addAttachments(id: number, keys: string[]): Promise<TaskDetail> {
    const { data } = await this.api.post<TaskDetail>(endpoints.attachments(id), { keys });
    return data;
  }

  async removeAttachment(id: number, key: string): Promise<TaskDetail> {
    const { data } = await this.api.post<TaskDetail>(endpoints.attachmentsRemove(id), { key });
    return data;
  }

  async reorderAttachments(id: number, keys: string[]): Promise<TaskDetail> {
    const { data } = await this.api.put<TaskDetail>(endpoints.attachmentsOrder(id), { keys });
    return data;
  }

  async listComments(taskId: number): Promise<TaskComment[]> {
    const { data } = await this.api.get<TaskComment[]>(endpoints.comments(taskId));
    return Array.isArray(data) ? data : [];
  }

  async addComment(taskId: number, body: Record<string, unknown>): Promise<TaskComment> {
    const { data } = await this.api.post<TaskComment>(endpoints.comments(taskId), { body });
    return data;
  }

  async updateComment(
    taskId: number,
    commentId: number,
    body: Record<string, unknown>,
  ): Promise<TaskComment> {
    const { data } = await this.api.patch<TaskComment>(endpoints.comment(taskId, commentId), {
      body,
    });
    return data;
  }

  async deleteComment(taskId: number, commentId: number): Promise<void> {
    await this.api.delete<void>(endpoints.comment(taskId, commentId));
  }

  async bulkSetAssignee(taskIds: number[], userId: number | null): Promise<TaskBulkResult> {
    const { data } = await this.api.post<TaskBulkResult>(endpoints.bulkAssignee(), { taskIds, userId });
    return data;
  }

  async bulkSetStatus(
    taskIds: number[],
    status: TaskStatus,
    blockedReason?: string,
  ): Promise<TaskBulkResult> {
    const { data } = await this.api.post<TaskBulkResult>(endpoints.bulkStatus(), {
      taskIds,
      status,
      blockedReason,
    });
    return data;
  }

  async bulkAddLabels(taskIds: number[], labelIds: number[]): Promise<TaskBulkResult> {
    const { data } = await this.api.post<TaskBulkResult>(endpoints.bulkLabels(), { taskIds, labelIds });
    return data;
  }

  async bulkDelete(taskIds: number[]): Promise<TaskBulkResult> {
    const { data } = await this.api.post<TaskBulkResult>(endpoints.bulkDelete(), { taskIds });
    return data;
  }
}
