import type { KpiOverview } from "../../domain/kpi-overview";
import type { FinancialSnapshot } from "../../domain/financial-snapshot";
import type { CostsBreakdown } from "../../domain/costs-breakdown";
import type { LeadsPerMonthPoint } from "../../domain/leads-per-month";
import type { BacklogItem, OutstandingBalanceItem } from "../../domain/financial-details";
import type { PipelineBucket, ProjectsStatusBucket } from "../../domain/pipeline-bucket";
import type { ProjectFinancialItem } from "../../domain/project-financial";
import type { RevenuePoint, TopClient } from "../../domain/revenue-point";
import type { ProjectHealth } from "../../domain/project-health";
import type { ExpensesSummary } from "../../domain/expenses-summary";
import type { QuickbooksParsedReport } from "../../domain/quickbooks-report";
import type {
  CostsBreakdownResponse,
  ExpensesSummaryResponse,
  LeadsPerMonthPointResponse,
  FinancialSnapshotResponse,
  OverviewResponse,
  PipelineBucketResponse,
  BacklogItemResponse,
  OutstandingBalanceItemResponse,
  ProjectHealthResponse,
  ProjectsStatusBucketResponse,
  ProjectFinancialItemResponse,
  QuickbooksParsedReportResponse,
  RevenuePointResponse,
  TopClientResponse,
} from "./responses";

const toNumber = (value: unknown): number => Number(value) || 0;

export const mapOverview = (dto: OverviewResponse | null | undefined): KpiOverview => ({
  leadsCount: toNumber(dto?.leadsCount),
  projectsCount: toNumber(dto?.projectsCount),
  wonLeadsCount: toNumber(dto?.wonLeadsCount),
  lostLeadsCount: toNumber(dto?.lostLeadsCount),
  winRate: toNumber(dto?.winRate),
  revenueTotal: toNumber(dto?.revenueTotal),
  outstandingTotal: toNumber(dto?.outstandingTotal),
  backlogTotal: toNumber(dto?.backlogTotal),
  revenuePipelineTotal: toNumber(dto?.revenuePipelineTotal),
  profit: toNumber(dto?.profit),
});

export const mapPipeline = (dto: PipelineBucketResponse[] | null | undefined): PipelineBucket[] =>
  (dto ?? []).map((item) => ({
    status: String(item?.status ?? "Unknown"),
    count: toNumber(item?.count),
    estimatedValue: toNumber(item?.estimatedValue),
  }));

export const mapProjectsStatus = (
  dto: ProjectsStatusBucketResponse[] | null | undefined,
): ProjectsStatusBucket[] =>
  (dto ?? []).map((item) => ({
    status: String(item?.status ?? "Unknown"),
    count: toNumber(item?.count),
  }));

export const mapFinancialSnapshot = (
  dto: FinancialSnapshotResponse | null | undefined,
): FinancialSnapshot => ({
  projectCount: toNumber(dto?.projectCount),
  estimatedTotal: toNumber(dto?.estimatedTotal),
  invoicedTotal: toNumber(dto?.invoicedTotal),
  paidTotal: toNumber(dto?.paidTotal),
  outstandingTotal: toNumber(dto?.outstandingTotal),
});

export const mapLeadsPerMonth = (
  dto: LeadsPerMonthPointResponse[] | null | undefined,
): LeadsPerMonthPoint[] =>
  (dto ?? []).map((item) => ({
    month: String(item?.month ?? ""),
    count: toNumber(item?.count),
  }));

export const mapRevenueTrend = (
  dto: RevenuePointResponse[] | null | undefined,
): RevenuePoint[] =>
  (dto ?? []).map((item) => ({
    month: String(item?.month ?? ""),
    revenue: toNumber(item?.revenue),
  }));

export const mapTopClients = (dto: TopClientResponse[] | null | undefined): TopClient[] =>
  (dto ?? []).map((item) => ({
    jobId: String(item?.jobId ?? ""),
    customerName: String(item?.customerName ?? "Unknown"),
    projectNumber: item?.projectNumber ? String(item.projectNumber) : null,
    totalInvoiced: toNumber(item?.totalInvoiced),
    totalPaid: toNumber(item?.totalPaid),
    totalOutstanding: toNumber(item?.totalOutstanding),
    invoiceCount: toNumber(item?.invoiceCount),
  }));

export const mapOutstandingBalances = (
  dto: OutstandingBalanceItemResponse[] | null | undefined,
): OutstandingBalanceItem[] =>
  (dto ?? []).map((item) => ({
    jobId: String(item?.jobId ?? ""),
    customerName: String(item?.customerName ?? "Unknown"),
    projectNumber: item?.projectNumber ? String(item.projectNumber) : null,
    totalInvoiced: toNumber(item?.totalInvoiced),
    totalOutstanding: toNumber(item?.totalOutstanding),
    invoiceCount: toNumber(item?.invoiceCount),
    oldestInvoiceDate: item?.oldestInvoiceDate ? String(item.oldestInvoiceDate) : null,
  }));

export const mapBacklog = (dto: BacklogItemResponse[] | null | undefined): BacklogItem[] =>
  (dto ?? []).map((item) => ({
    jobId: String(item?.jobId ?? ""),
    customerName: String(item?.customerName ?? "Unknown"),
    projectNumber: item?.projectNumber ? String(item.projectNumber) : null,
    estimatedAmount: toNumber(item?.estimatedAmount),
    invoicedAmount: toNumber(item?.invoicedAmount),
    backlogAmount: toNumber(item?.backlogAmount),
    estimateCount: toNumber(item?.estimateCount),
    invoiceCount: toNumber(item?.invoiceCount),
  }));

export const mapQuickbooksParsedReport = (
  dto: QuickbooksParsedReportResponse | null | undefined,
): QuickbooksParsedReport => ({
  reportName: String(dto?.reportName ?? ""),
  rows: (dto?.rows ?? []).map((row) => ({
    reportName: String(row?.reportName ?? dto?.reportName ?? ""),
    section: String(row?.section ?? ""),
    group: String(row?.group ?? ""),
    label: String(row?.label ?? ""),
    columns: row?.columns ?? {},
    amount: toNumber(row?.amount),
    entityId: row?.entityId ? String(row.entityId) : undefined,
    depth: toNumber(row?.depth),
    path: Array.isArray(row?.path) ? row.path.map((item) => String(item)) : [],
  })),
  summary:
    dto?.summary && typeof dto.summary === "object"
      ? Object.fromEntries(
          Object.entries(dto.summary).map(([key, value]) => [key, toNumber(value)]),
        )
      : {},
  coverage: {
    start: String(dto?.coverage?.start ?? ""),
    end: String(dto?.coverage?.end ?? ""),
    dateChunks: (dto?.coverage?.dateChunks ?? []).map((chunk) => ({
      start: String(chunk?.start ?? ""),
      end: String(chunk?.end ?? ""),
    })),
  },
});

export const mapProjectFinancials = (
  dto: ProjectFinancialItemResponse[] | null | undefined,
): ProjectFinancialItem[] =>
  (dto ?? []).map((item) => ({
    projectNumber: String(item?.projectNumber ?? ""),
    found: Boolean(item?.found),
    estimatedAmount: toNumber(item?.estimatedAmount),
    estimateCount: toNumber(item?.estimateCount),
    invoicedAmount: toNumber(item?.invoicedAmount),
    invoiceCount: toNumber(item?.invoiceCount),
    paidAmount: toNumber(item?.paidAmount),
    outstandingAmount: toNumber(item?.outstandingAmount),
    paidPercentage: toNumber(item?.paidPercentage),
    estimateVsInvoicedDelta: toNumber(item?.estimateVsInvoicedDelta),
  }));

export const mapExpensesSummary = (
  dto: ExpensesSummaryResponse | null | undefined,
): ExpensesSummary => ({
  totalExpenses: toNumber(dto?.totalExpenses),
  totalCogs: toNumber(dto?.totalCogs),
  period: {
    from: String(dto?.period?.from ?? ""),
    to: String(dto?.period?.to ?? ""),
  },
});

export const mapCostsBreakdown = (
  dto: CostsBreakdownResponse | null | undefined,
): CostsBreakdown => ({
  totalCosts: toNumber(dto?.totalCosts),
  totalExpenses: toNumber(dto?.totalExpenses),
  totalCogs: toNumber(dto?.totalCogs),
  categories: (dto?.categories ?? []).map((item) => ({
    category: String(item?.category ?? "Unknown"),
    section: item?.section === "COGS" ? "COGS" : "EXPENSES",
    amount: toNumber(item?.amount),
  })),
  period: {
    from: String(dto?.period?.from ?? ""),
    to: String(dto?.period?.to ?? ""),
  },
});

export const mapProjectHealth = (
  dto: ProjectHealthResponse[] | null | undefined,
): ProjectHealth[] =>
  (dto ?? []).map((item) => ({
    projectId: toNumber(item?.projectId),
    projectNumber: String(item?.projectNumber ?? ""),
    projectName: String(item?.projectName ?? "Unknown"),
    status: item?.status ? String(item.status) : undefined,
    grossMarginPercent: toNumber(item?.grossMarginPercent),
    backlogAmount: toNumber(item?.backlogAmount),
    riskLevel:
      item?.riskLevel === "high" || item?.riskLevel === "medium"
        ? item.riskLevel
        : "low",
    reasons: Array.isArray(item?.reasons) ? item.reasons.map((r) => String(r)) : [],
  }));
