import type { ReportsRepositoryPort, ReportSubmitResult } from "../../domain/ports";
import type { RestorationFinalReport, RestorationVisitReport } from "../../domain/models";
import type { HttpClientLike } from "@/shared/infra";
import { optimizedApiClient } from "@/shared/infra";
import { reportEndpoints } from "./endpoints";
import {
  type RestorationFinalDTO,
  type RestorationVisitDTO,
  type SubmitReportResponse,
  buildRestorationFinalFormData,
  buildRestorationVisitFormData,
  mapRestorationFinalFromApi,
  mapRestorationVisitFromApi,
  normalizeSubmitResponse,
} from "./mappers";

export class ReportsHttpRepository implements ReportsRepositoryPort {
  constructor(private readonly api: HttpClientLike = optimizedApiClient) {}

  async getRestorationVisit(projectId: number): Promise<RestorationVisitReport> {
    try {
      const { data } = await this.api.get<RestorationVisitDTO>(
        reportEndpoints.restorationVisit.get(projectId)
      );
      return mapRestorationVisitFromApi(data ?? {});
    } catch (error: any) {
      // Si el endpoint no existe (404) o no hay datos, devolver objeto vacío
      if (error?.response?.status === 404) {
        return mapRestorationVisitFromApi({});
      }
      throw error;
    }
  }

  async submitRestorationVisit(report: RestorationVisitReport): Promise<ReportSubmitResult> {
    const formData = buildRestorationVisitFormData(report);
    const { data } = await this.api.post<SubmitReportResponse>(
      reportEndpoints.restorationVisit.submit(),
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return normalizeSubmitResponse(data);
  }

  async getRestorationFinal(projectId: number): Promise<RestorationFinalReport> {
    try {
      const { data } = await this.api.get<RestorationFinalDTO>(
        reportEndpoints.restorationFinal.get(projectId)
      );
      return mapRestorationFinalFromApi(data ?? {});
    } catch (error: any) {
      // Si el endpoint no existe (404) o no hay datos, devolver objeto vacío
      if (error?.response?.status === 404) {
        return mapRestorationFinalFromApi({});
      }
      throw error;
    }
  }

  async submitRestorationFinal(report: RestorationFinalReport): Promise<ReportSubmitResult> {
    const formData = buildRestorationFinalFormData(report);
    const { data } = await this.api.post<SubmitReportResponse>(
      reportEndpoints.restorationFinal.submit(),
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return normalizeSubmitResponse(data);
  }
}


