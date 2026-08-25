export const TASK_WORKSPACE_ENTITY_KINDS = ['lead', 'project', 'contact', 'company'] as const;
export type TaskWorkspaceEntityKind = (typeof TASK_WORKSPACE_ENTITY_KINDS)[number];
export const TASK_WORKSPACE_RELATIONSHIPS = ['primary', 'related', 'client', 'supplier', 'subcontractor', 'contact'] as const;
export type TaskWorkspaceRelationship = (typeof TASK_WORKSPACE_RELATIONSHIPS)[number];
export type TaskWorkspaceType = 'system_default' | 'custom';

export interface TaskWorkspaceLink {
  workspaceId: number;
  entityKind: TaskWorkspaceEntityKind;
  entityId: number;
  relationship: TaskWorkspaceRelationship;
}

export interface TaskWorkspaceFolder {
  id: number;
  workspaceId: number;
  parentFolderId: number | null;
  title: string;
  position: number;
  children?: TaskWorkspaceFolder[];
}

export interface TaskWorkspaceFile {
  id: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  position: number;
  status: 'pending' | 'ready' | 'failed';
  previewUrl?: string | null;
}

export interface TaskWorkspaceSummary {
  id: number;
  title: string;
  workspaceType: TaskWorkspaceType;
  systemKey: string | null;
  archivedAt: string | null;
  linkCount: number;
  folderCount: number;
  taskCount: number;
  fileCount: number;
}

export interface TaskWorkspace extends TaskWorkspaceSummary {
  description: Record<string, unknown> | null;
  descriptionText: string | null;
  links: TaskWorkspaceLink[];
  folders: TaskWorkspaceFolder[];
  files: TaskWorkspaceFile[];
}

export type TaskWorkspaceDraft = Readonly<{
  title: string;
  description?: Record<string, unknown>;
  workspaceType?: TaskWorkspaceType;
  links?: Array<Pick<TaskWorkspaceLink, 'entityKind' | 'entityId'> & { relationship?: TaskWorkspaceRelationship }>;
}>;

export type TaskWorkspacePatch = Readonly<{
  title?: string;
  description?: Record<string, unknown> | null;
}>;
