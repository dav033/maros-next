import type { LeadType } from "@/leads/domain";
import type { AnalyticsRepositoryPort } from "../../domain/ports";
import type { HttpClientLike } from "@/shared/infra/http";
import { optimizedApiClient } from "@/shared/infra/http";
import { analyticsEndpoints } from "./endpoints";
import {
  mapAging,
  mapExpensesSummary,
  mapFinancialSnapshot,
  mapOverview,
  mapPipeline,
  mapProjectHealth,
  mapProjectsStatus,
  mapBacklog,
  mapOutstandingBalances,
  mapProjectFinancials,
  mapQuickbooksParsedReport,
  mapRevenueTrend,
  mapTopClients,
} from "./mappers";
import type {
  AgingBucketResponse,
  BacklogItemResponse,
  ExpensesSummaryResponse,
  FinancialSnapshotResponse,
  OutstandingBalanceItemResponse,
  OverviewResponse,
  ProjectFinancialItemResponse,
  PipelineBucketResponse,
  ProjectHealthResponse,
  ProjectsStatusBucketResponse,
  QuickbooksParsedReportResponse,
  RefreshResponse,
  RevenuePointResponse,
  TopClientResponse,
} from "./responses";

export class AnalyticsHttpRepository implements AnalyticsRepositoryPort {
  constructor(private readonly api: HttpClientLike = optimizedApiClient) {}

  async getOverview(params?: { from?: string; to?: string; leadType?: LeadType }) {
    const { data } = await this.api.get<OverviewResponse>(analyticsEndpoints.overview(), { params });
    return mapOverview(data);
  }

  async getPipeline(params?: { leadType?: LeadType }) {
    const { data } = await this.api.get<PipelineBucketResponse[]>(analyticsEndpoints.pipeline(), {
      params,
    });
    return mapPipeline(data);
  }

  async getProjectsStatus(params?: { leadType?: LeadType }) {
    const { data } = await this.api.get<ProjectsStatusBucketResponse[]>(
      analyticsEndpoints.projectsStatus(),
      { params },
    );
    return mapProjectsStatus(data);
  }

  async getFinancialSnapshot(params?: { leadType?: LeadType }) {
    const { data } = await this.api.get<FinancialSnapshotResponse>(
      analyticsEndpoints.financialSnapshot(),
      { params },
    );
    return mapFinancialSnapshot(data);
  }

  async getAging(params?: { leadType?: LeadType }) {
    const { data } = await this.api.get<AgingBucketResponse[]>(analyticsEndpoints.aging(), {
      params,
    });
    return mapAging(data);
  }

  async getRevenueTrend(params?: { months?: number; from?: string; to?: string; leadType?: LeadType }) {
    const months = params?.months ?? 12;
    const { data } = await this.api.get<RevenuePointResponse[]>(analyticsEndpoints.revenueTrend(), {
      params: {
        months,
        from: params?.from,
        to: params?.to,
        leadType: params?.leadType,
      },
    });
    return mapRevenueTrend(data);
  }

  async getTopClients(params?: { limit?: number; by?: "revenue" | "volume"; leadType?: LeadType }) {
    const { data } = await this.api.get<TopClientResponse[]>(analyticsEndpoints.topClients(), {
      params,
    });
    return mapTopClients(data);
  }

  async getOutstandingBalances(params?: { limit?: number; leadType?: LeadType }) {
    const { data } = await this.api.get<OutstandingBalanceItemResponse[]>(
      analyticsEndpoints.outstandingBalances(),
      { params },
    );
    return mapOutstandingBalances(data);
  }

  async getBacklog(params?: { limit?: number; leadType?: LeadType }) {
    const { data } = await this.api.get<BacklogItemResponse[]>(analyticsEndpoints.backlog(), {
      params,
    });
    return mapBacklog(data);
  }

  async getQuickbooksRevenueReport(params?: { from?: string; to?: string }) {
    const { data } = await this.api.get<QuickbooksParsedReportResponse>(
      analyticsEndpoints.quickbooksRevenueReport(),
      { params },
    );
    return mapQuickbooksParsedReport(data);
  }

  async getProjectFinancials(params?: { limit?: number; leadType?: LeadType }) {
    const { data } = await this.api.get<ProjectFinancialItemResponse[]>(
      analyticsEndpoints.projectFinancials(),
      { params },
    );
    return mapProjectFinancials(data);
  }

  async getProjectHealth(params?: { leadType?: LeadType }) {
    const { data } = await this.api.get<ProjectHealthResponse[]>(
      analyticsEndpoints.projectHealth(),
      { params },
    );
    return mapProjectHealth(data);
  }

  async getExpensesSummary(params?: { from?: string; to?: string }) {
    const { data } = await this.api.get<ExpensesSummaryResponse>(
      analyticsEndpoints.expensesSummary(),
      { params },
    );
    return mapExpensesSummary(data);
  }

  async refresh() {
    const { data } = await this.api.post<RefreshResponse>(analyticsEndpoints.refresh());
    return { ok: Boolean(data?.ok) };
  }
}
