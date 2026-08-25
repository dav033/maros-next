import type { TaskWorkspace, TaskWorkspaceDraft, TaskWorkspacePatch, TaskWorkspaceSummary } from './models';
import type { TaskWorkspaceEntityKind } from './models';

export type TaskWorkspaceSearch = Readonly<{
  query?: string;
  includeArchived?: boolean;
  entityKind?: TaskWorkspaceEntityKind;
  entityId?: number;
  page?: number;
  limit?: number;
}>;

export interface TaskWorkspacesRepositoryPort {
  list(search?: TaskWorkspaceSearch): Promise<{ items: TaskWorkspaceSummary[]; totalCount: number; page: number; limit: number }>;
  get(id: number): Promise<TaskWorkspace>;
  create(draft: TaskWorkspaceDraft): Promise<TaskWorkspace>;
  update(id: number, patch: TaskWorkspacePatch): Promise<TaskWorkspace>;
  archive(id: number): Promise<void>;
  restore(id: number): Promise<TaskWorkspace>;
  addLinks(id: number, links: TaskWorkspaceDraft['links']): Promise<TaskWorkspace>;
  removeLink(id: number, entityKind: TaskWorkspaceEntityKind, entityId: number): Promise<TaskWorkspace>;
  listFolders(workspaceId: number): Promise<import('./models').TaskWorkspaceFolder[]>;
  createFolder(workspaceId: number, input: { title: string; parentFolderId?: number | null; position?: number }): Promise<import('./models').TaskWorkspaceFolder>;
  updateFolder(workspaceId: number, folderId: number, input: { title?: string; parentFolderId?: number | null; position?: number }): Promise<import('./models').TaskWorkspaceFolder>;
  removeFolder(workspaceId: number, folderId: number, destinationFolderId?: number | null): Promise<void>;
  moveTask(workspaceId: number, taskId: number, folderId?: number | null): Promise<unknown>;
}
