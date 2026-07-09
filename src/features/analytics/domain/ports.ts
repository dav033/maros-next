import type { LeadType } from "@/leads/domain";
import type { FinancialSnapshot } from "./financial-snapshot";
import type { BacklogItem, OutstandingBalanceItem } from "./financial-details";
import type { CostsBreakdown } from "./costs-breakdown";
import type { ExpensesSummary } from "./expenses-summary";
import type { LeadsPerMonthPoint } from "./leads-per-month";
import type { KpiOverview } from "./kpi-overview";
import type { PipelineBucket, ProjectsStatusBucket } from "./pipeline-bucket";
import type { ProjectFinancialItem } from "./project-financial";
import type { ProjectHealth } from "./project-health";
import type { QuickbooksParsedReport } from "./quickbooks-report";
import type { RevenuePoint, TopClient } from "./revenue-point";

export interface AnalyticsRepositoryPort {
  getOverview(params?: { from?: string; to?: string; leadType?: LeadType }): Promise<KpiOverview>;
  getPipeline(params?: { leadType?: LeadType }): Promise<PipelineBucket[]>;
  getProjectsStatus(params?: { leadType?: LeadType }): Promise<ProjectsStatusBucket[]>;
  getFinancialSnapshot(params?: { leadType?: LeadType }): Promise<FinancialSnapshot>;
  getLeadsPerMonth(params?: {
    months?: number;
    from?: string;
    to?: string;
    leadType?: LeadType;
  }): Promise<LeadsPerMonthPoint[]>;
  getRevenueTrend(params?: {
    months?: number;
    from?: string;
    to?: string;
    leadType?: LeadType;
  }): Promise<RevenuePoint[]>;
  getTopClients(params?: {
    limit?: number;
    by?: "revenue" | "volume";
    leadType?: LeadType;
  }): Promise<TopClient[]>;
  getOutstandingBalances(params?: { limit?: number; leadType?: LeadType }): Promise<OutstandingBalanceItem[]>;
  getBacklog(params?: { limit?: number; leadType?: LeadType }): Promise<BacklogItem[]>;
  getProjectFinancials(params?: { limit?: number; leadType?: LeadType }): Promise<ProjectFinancialItem[]>;
  getQuickbooksRevenueReport(params?: {
    from?: string;
    to?: string;
  }): Promise<QuickbooksParsedReport>;
  getProjectHealth(params?: { leadType?: LeadType }): Promise<ProjectHealth[]>;
  getExpensesSummary(params?: {
    from?: string;
    to?: string;
    leadType?: LeadType;
  }): Promise<ExpensesSummary>;
  getCostsBreakdown(params?: {
    from?: string;
    to?: string;
    leadType?: LeadType;
  }): Promise<CostsBreakdown>;
  refresh(): Promise<{ ok: boolean }>;
}
