import type { LeadType } from "@/leads/domain";

export const analyticsKeys = {
  all: ["analytics"] as const,
  overview: (from?: string, to?: string, leadType?: LeadType) =>
    [...analyticsKeys.all, "overview", from ?? "", to ?? "", leadType ?? ""] as const,
  pipeline: (leadType?: LeadType) =>
    [...analyticsKeys.all, "pipeline", leadType ?? ""] as const,
  projectsStatus: (leadType?: LeadType) =>
    [...analyticsKeys.all, "projects-status", leadType ?? ""] as const,
  financialSnapshot: (leadType?: LeadType) =>
    [...analyticsKeys.all, "financial-snapshot", leadType ?? ""] as const,
  aging: (leadType?: LeadType) =>
    [...analyticsKeys.all, "aging", leadType ?? ""] as const,
  revenueTrend: (months: number, from?: string, to?: string, leadType?: LeadType) =>
    [...analyticsKeys.all, "revenue-trend", months, from ?? "", to ?? "", leadType ?? ""] as const,
  topClients: (limit: number, by: "revenue" | "volume", leadType?: LeadType) =>
    [...analyticsKeys.all, "top-clients", limit, by, leadType ?? ""] as const,
  outstandingBalances: (limit: number, leadType?: LeadType) =>
    [...analyticsKeys.all, "outstanding-balances", limit, leadType ?? ""] as const,
  backlog: (limit: number, leadType?: LeadType) =>
    [...analyticsKeys.all, "backlog", limit, leadType ?? ""] as const,
  projectFinancials: (limit: number, leadType?: LeadType) =>
    [...analyticsKeys.all, "project-financials", limit, leadType ?? ""] as const,
  quickbooksRevenueReport: (from?: string, to?: string) =>
    [...analyticsKeys.all, "quickbooks-revenue-report", from ?? "", to ?? ""] as const,
  projectHealth: (leadType?: LeadType) =>
    [...analyticsKeys.all, "project-health", leadType ?? ""] as const,
} as const;
