import { optimizedApiClient } from "@/shared/infra";
import type { HttpClientLike } from "@/shared/infra";
import type { TaskWorkspaceEntityKind } from "../domain/models";
import type {
  TaskWorkspace,
  TaskWorkspaceDraft,
  TaskWorkspaceFolder,
  TaskWorkspacePatch,
  TaskWorkspaceSearch,
  TaskWorkspaceSummary,
} from "../domain";
import type { TaskWorkspacesRepositoryPort } from "../domain/ports";

export class TaskWorkspacesHttpRepository implements TaskWorkspacesRepositoryPort {
  constructor(private readonly api: HttpClientLike = optimizedApiClient) {}

  async list(search?: TaskWorkspaceSearch) {
    const { data } = await this.api.get<{ items: TaskWorkspaceSummary[]; totalCount: number; page: number; limit: number }>("/task-workspaces", { params: search });
    return data ?? { items: [], totalCount: 0, page: 1, limit: 50 };
  }
  async get(id: number) { const { data } = await this.api.get<TaskWorkspace>(`/task-workspaces/${id}`); return data; }
  async create(draft: TaskWorkspaceDraft) { const { data } = await this.api.post<TaskWorkspace>("/task-workspaces", draft); return data; }
  async update(id: number, patch: TaskWorkspacePatch) { const { data } = await this.api.patch<TaskWorkspace>(`/task-workspaces/${id}`, patch); return data; }
  async archive(id: number) { await this.api.post(`/task-workspaces/${id}/archive`, {}); }
  async restore(id: number) { const { data } = await this.api.post<TaskWorkspace>(`/task-workspaces/${id}/restore`, {}); return data; }
  async addLinks(id: number, links: TaskWorkspaceDraft['links']) { const { data } = await this.api.post<TaskWorkspace>(`/task-workspaces/${id}/links`, { links }); return data; }
  async removeLink(id: number, entityKind: TaskWorkspaceEntityKind, entityId: number) { const { data } = await this.api.delete<TaskWorkspace>(`/task-workspaces/${id}/links/${entityKind}/${entityId}`); return data; }
  async listFolders(workspaceId: number) { const { data } = await this.api.get<TaskWorkspaceFolder[]>(`/task-workspaces/${workspaceId}/folders`); return data ?? []; }
  async createFolder(workspaceId: number, input: { title: string; parentFolderId?: number | null; position?: number }) { const { data } = await this.api.post<TaskWorkspaceFolder>(`/task-workspaces/${workspaceId}/folders`, input); return data; }
  async updateFolder(workspaceId: number, folderId: number, input: { title?: string; parentFolderId?: number | null; position?: number }) { const { data } = await this.api.patch<TaskWorkspaceFolder>(`/task-workspaces/${workspaceId}/folders/${folderId}`, input); return data; }
  async removeFolder(workspaceId: number, folderId: number, _destinationFolderId?: number | null) { await this.api.delete(`/task-workspaces/${workspaceId}/folders/${folderId}`); }
  async moveTask(workspaceId: number, taskId: number, folderId?: number | null) { const { data } = await this.api.post(`/task-workspaces/${workspaceId}/tasks/${taskId}/move`, { folderId }); return data; }
}
