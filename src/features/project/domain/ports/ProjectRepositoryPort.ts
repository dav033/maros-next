import type { LeadId, Project, ProjectDraft, ProjectId, ProjectPatch, ProjectStatus } from "@/project/domain";

export interface ProjectRepositoryPort {
  findById(id: ProjectId): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  findByStatus(status: ProjectStatus): Promise<Project[]>;
  findWithLeads(): Promise<Project[]>;
  saveNew(draft: ProjectDraft): Promise<Project>;
  update(id: ProjectId, patch: ProjectPatch): Promise<Project>;
  delete(id: ProjectId): Promise<void>;
  findByName(projectName: string): Promise<Project | null>;
  leadExists(leadId: LeadId): Promise<boolean>;
  count(): Promise<number>;
}
