import type { ApiProjectDTO } from "@/project/domain/services/projectReadMapper";
import type { ProjectCostBreakdown, ProjectId, Project, ProjectDraft, ProjectPatch, ProjectPaymentsResponse, ProjectFinancialsEntry, ProjectQboReport, QboReportParams, QuickbooksImportBatchReport, QuickbooksImportDecision, QuickbooksImportJob, QuickbooksJobDeactivation } from "@/project/domain/models";
import type { ProjectRepositoryPort } from "@/project/domain/ports";
import { optimizedApiClient } from "@/shared/infra/http";
import { makeHttpResourceRepository } from "@/shared/infra/rest";
import type { ResourceRepository } from "@/shared/infra/rest";
import type { HttpClientLike } from "@/shared/infra/http";

import { endpoints as projectEndpoints } from "./endpoints";
import {
  type CreateProjectPayload,
  type UpdateProjectPayload,
  mapFinancialsFromApi,
  mapProjectDraftToCreatePayload,
  mapProjectFromApi,
  mapProjectPatchToUpdatePayload,
  mapProjectsFromApi,
} from "./mappers";

export class ProjectHttpRepository implements ProjectRepositoryPort {
  private readonly resource: ResourceRepository<number, Project, ProjectDraft, ProjectPatch>;

  constructor(private readonly api: HttpClientLike = optimizedApiClient) {
    this.resource = makeHttpResourceRepository<number, ApiProjectDTO, Project, ProjectDraft, ProjectPatch>({
      endpoints: projectEndpoints,
      mappers: { fromApi: mapProjectFromApi, fromApiList: mapProjectsFromApi },
      api: this.api,
    });
  }

  getById = (id: number) => this.resource.getById(id);
  list = () => this.resource.list();
  delete = (id: number) => this.resource.delete(id);

  listFinancials = async (): Promise<ProjectFinancialsEntry[]> => {
    const { data } = await this.api.get(projectEndpoints.financials());
    return mapFinancialsFromApi(data);
  };

  create = async (draft: ProjectDraft): Promise<Project> => {
    const payload: CreateProjectPayload = mapProjectDraftToCreatePayload(draft);
    const { data } = await this.api.post<ApiProjectDTO>(
      projectEndpoints.create(),
      payload
    );
    if (!data) throw new Error("Empty response creating Project");
    return mapProjectFromApi(data);
  };

  update = async (id: number, patch: ProjectPatch): Promise<Project> => {
    const payload = mapProjectPatchToUpdatePayload(patch);
    const url = projectEndpoints.update(id);
    const { data } = await this.api.put<ApiProjectDTO>(url, payload);
    if (!data) throw new Error("Empty response updating Project");
    return mapProjectFromApi(data);
  };

  async getDetails(id: number): Promise<any> {
    try {
      const { data } = await this.api.get(projectEndpoints.details(id));
      return data;
    } catch (error: any) {
      throw error;
    }
  }

  revertToLead = async (id: number): Promise<{ leadId: number }> => {
    const { data } = await this.api.post<{ leadId: number }>(
      projectEndpoints.revertToLead(id),
      {},
    );
    if (!data) throw new Error("Empty response reverting project to lead");
    return data;
  };

  getPaymentDetails = async (id: number): Promise<ProjectPaymentsResponse> => {
    const { data } = await this.api.get<ProjectPaymentsResponse>(projectEndpoints.payments(id));
    if (!data) throw new Error("Empty response loading project payments");
    return data;
  };

  getQboReport = async (id: number, params: QboReportParams): Promise<ProjectQboReport> => {
    // El ValidationPipe del backend corre con forbidNonWhitelisted, así que sólo
    // pueden viajar los parámetros del DTO y sin claves vacías.
    const query: Record<string, string> = {
      report: params.report,
      accountingMethod: params.accountingMethod,
    };
    if (params.startDate) query.startDate = params.startDate;
    if (params.endDate) query.endDate = params.endDate;

    const { data } = await this.api.get<ProjectQboReport>(projectEndpoints.qboReport(id), {
      params: query,
    });
    if (!data) throw new Error("Empty response loading project QuickBooks report");
    return data;
  };

  getCostBreakdown = async (id: ProjectId): Promise<ProjectCostBreakdown> => {
    const { data } = await this.api.get<ProjectCostBreakdown>(
      projectEndpoints.costBreakdown(id),
    );
    if (!data) throw new Error("Empty response loading project cost breakdown");
    return data;
  };

  listQuickbooksImportJobs = async (): Promise<QuickbooksImportJob[]> => {
    const { data } = await this.api.get<QuickbooksImportJob[]>(
      projectEndpoints.quickbooksImportJobs(),
    );
    return data ?? [];
  };

  importQuickbooksJobsBatch = async (
    decisions: readonly QuickbooksImportDecision[],
  ): Promise<QuickbooksImportBatchReport> => {
    const { data } = await this.api.post<QuickbooksImportBatchReport>(
      projectEndpoints.quickbooksImportBatch(),
      { decisions },
    );
    if (!data) throw new Error("Empty response importing QuickBooks jobs");
    return data;
  };

  deactivateQuickbooksJob = async (
    qboCustomerId: string,
  ): Promise<QuickbooksJobDeactivation> => {
    // `confirm` lo exige el servidor en el cuerpo: es la guarda que impide que
    // una escritura en la contabilidad salga de una llamada mal interpretada.
    const { data } = await this.api.post<QuickbooksJobDeactivation>(
      projectEndpoints.quickbooksImportDeactivateJob(),
      { qboCustomerId, confirm: true },
    );
    if (!data) throw new Error("Empty response deactivating QuickBooks job");
    return data;
  };
}

