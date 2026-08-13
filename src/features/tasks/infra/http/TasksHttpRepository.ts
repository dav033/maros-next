import type { HttpClientLike } from "@/shared/infra";
import { optimizedApiClient } from "@/shared/infra";
import type {
  Task,
  TaskBoardColumns,
  TaskComment,
  TaskDetail,
  TaskDraft,
  TaskEntityLink,
  TaskFilters,
  TaskMoveInput,
  TaskMoveResult,
  TaskPatch,
  TasksRepositoryPort,
} from "@/features/tasks/domain";

import { endpoints } from "./endpoints";

/**
 * No DTO mapping here: TaskMapper on the backend already emits exactly this shape
 * (camelCase, same field names as the domain model), so there is nothing to translate —
 * same choice UsersHttpRepository made, unlike notes' heavier mappers.ts.
 */
export class TasksHttpRepository implements TasksRepositoryPort {
  constructor(private readonly api: HttpClientLike = optimizedApiClient) {}

  async list(filters?: TaskFilters): Promise<Task[]> {
    // .base directly: buildCrudEndpoints types `list` optional (it isn't, here, but
    // the type doesn't know that) — see NotePageHttpRepository.list for the same call.
    const { data } = await this.api.get<Task[]>(endpoints.base, {
      params: filters,
    });
    return Array.isArray(data) ? data : [];
  }

  async getBoard(): Promise<TaskBoardColumns> {
    const { data } = await this.api.get<TaskBoardColumns>(endpoints.board());
    return data ?? {};
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
}
