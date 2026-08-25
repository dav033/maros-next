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
}
