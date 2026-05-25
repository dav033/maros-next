export const analyticsKeys = {
  all: ["analytics"] as const,
  overview: (from?: string, to?: string) =>
    [...analyticsKeys.all, "overview", from ?? "", to ?? ""] as const,
  pipeline: () => [...analyticsKeys.all, "pipeline"] as const,
  projectsStatus: () => [...analyticsKeys.all, "projects-status"] as const,
  financialSnapshot: () => [...analyticsKeys.all, "financial-snapshot"] as const,
  aging: () => [...analyticsKeys.all, "aging"] as const,
  revenueTrend: (months: number, from?: string, to?: string) =>
    [...analyticsKeys.all, "revenue-trend", months, from ?? "", to ?? ""] as const,
  topClients: (limit: number, by: "revenue" | "volume") =>
    [...analyticsKeys.all, "top-clients", limit, by] as const,
  outstandingBalances: (limit: number) =>
    [...analyticsKeys.all, "outstanding-balances", limit] as const,
  backlog: (limit: number) => [...analyticsKeys.all, "backlog", limit] as const,
  projectFinancials: (limit: number) =>
    [...analyticsKeys.all, "project-financials", limit] as const,
  quickbooksRevenueReport: (from?: string, to?: string) =>
    [...analyticsKeys.all, "quickbooks-revenue-report", from ?? "", to ?? ""] as const,
  projectHealth: () => [...analyticsKeys.all, "project-health"] as const,
} as const;
