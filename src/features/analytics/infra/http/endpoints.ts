import { api } from "@/shared/infra/rest";

const BASE = api.resource("analytics");

export const analyticsEndpoints = {
  overview: () => `${BASE}/overview`,
  pipeline: () => `${BASE}/pipeline`,
  projectsStatus: () => `${BASE}/projects-status`,
  financialSnapshot: () => `${BASE}/financial-snapshot`,
  leadsPerMonth: () => `${BASE}/leads-per-month`,
  revenueTrend: () => `${BASE}/revenue-trend`,
  topClients: () => `${BASE}/top-clients`,
  outstandingBalances: () => `${BASE}/outstanding-balances`,
  backlog: () => `${BASE}/backlog`,
  projectFinancials: () => `${BASE}/project-financials`,
  quickbooksRevenueReport: () => `${BASE}/quickbooks-revenue-report`,
  projectHealth: () => `${BASE}/project-health`,
  expensesSummary: () => `${BASE}/expenses-summary`,
  costsBreakdown: () => `${BASE}/costs-breakdown`,
  refresh: () => `${BASE}/refresh`,
} as const;
