import type { Project, ProjectDraft, ProjectId, ProjectPatch, ProjectPaymentsResponse, ProjectFinancialsEntry, ProjectQboReport, QboReportParams, QuickbooksImportBatchReport, QuickbooksImportDecision, QuickbooksImportJob } from "./models";

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
  /** Reporte de QuickBooks acotado al cliente del proyecto, devuelto verbatim. */
  getQboReport(id: ProjectId, params: QboReportParams): Promise<ProjectQboReport>;
  /** Jobs activos de QuickBooks, ya diagnosticados (estado, papel y colisiones). */
  listQuickbooksImportJobs(): Promise<QuickbooksImportJob[]>;
  /**
   * Aplica muchas decisiones de una vez. Un lote entero rechazado sigue siendo
   * 2xx: los fallos por decisión vienen en `results`, no como error HTTP.
   */
  importQuickbooksJobsBatch(
    decisions: readonly QuickbooksImportDecision[],
  ): Promise<QuickbooksImportBatchReport>;
}



