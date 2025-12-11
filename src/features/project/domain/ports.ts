import type { Project, ProjectDraft, ProjectId, ProjectPatch } from "./models";

export interface ProjectRepositoryPort {
  getById(id: ProjectId): Promise<Project | null>;
  list(): Promise<Project[]>;
  create(draft: ProjectDraft): Promise<Project>;
  update(id: ProjectId, patch: ProjectPatch): Promise<Project>;
  delete(id: ProjectId): Promise<void>;
}



