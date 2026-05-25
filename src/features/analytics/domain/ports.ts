import type { AgingBucket, FinancialSnapshot } from "./financial-snapshot";
import type { BacklogItem, OutstandingBalanceItem } from "./financial-details";
import type { KpiOverview } from "./kpi-overview";
import type { PipelineBucket, ProjectsStatusBucket } from "./pipeline-bucket";
import type { ProjectFinancialItem } from "./project-financial";
import type { ProjectHealth } from "./project-health";
import type { QuickbooksParsedReport } from "./quickbooks-report";
import type { RevenuePoint, TopClient } from "./revenue-point";

export interface AnalyticsRepositoryPort {
  getOverview(params?: { from?: string; to?: string }): Promise<KpiOverview>;
  getPipeline(): Promise<PipelineBucket[]>;
  getProjectsStatus(): Promise<ProjectsStatusBucket[]>;
  getFinancialSnapshot(): Promise<FinancialSnapshot>;
  getAging(): Promise<AgingBucket[]>;
  getRevenueTrend(params?: {
    months?: number;
    from?: string;
    to?: string;
  }): Promise<RevenuePoint[]>;
  getTopClients(params?: {
    limit?: number;
    by?: "revenue" | "volume";
  }): Promise<TopClient[]>;
  getOutstandingBalances(params?: { limit?: number }): Promise<OutstandingBalanceItem[]>;
  getBacklog(params?: { limit?: number }): Promise<BacklogItem[]>;
  getProjectFinancials(params?: { limit?: number }): Promise<ProjectFinancialItem[]>;
  getQuickbooksRevenueReport(params?: {
    from?: string;
    to?: string;
  }): Promise<QuickbooksParsedReport>;
  getProjectHealth(): Promise<ProjectHealth[]>;
  refresh(): Promise<{ ok: boolean }>;
}
