import type { Project, ProjectDraft, ProjectId, ProjectPatch, ProjectPaymentsResponse, ProjectFinancialsEntry } from "./models";

export interface ProjectRepositoryPort {
  getById(id: ProjectId): Promise<Project | null>;
  list(): Promise<Project[]>;
  /** QuickBooks financial summary for every project, fetched separately from `list()` so it never blocks the project list. */
  listFinancials(): Promise<ProjectFinancialsEntry[]>;
  create(draft: ProjectDraft): Promise<Project>;
  update(id: ProjectId, patch: ProjectPatch): Promise<Project>;
  delete(id: ProjectId): Promise<void>;
  revertToLead(id: ProjectId): Promise<{ leadId: number }>;
  getPaymentDetails(id: ProjectId): Promise<ProjectPaymentsResponse>;
}



