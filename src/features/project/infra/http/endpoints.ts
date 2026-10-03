import { api, buildCrudEndpoints } from "@/shared/infra/rest";

const BASE = api.resource("projects");

export const endpoints = {
  ...buildCrudEndpoints<number>(BASE, {
    listPath: "/all",
  }),
  financials: () => `${BASE}/financials`,
  details: (id: number | string) => `${BASE}/${id}/details`,
  estimateFile: (id: number | string) => `${BASE}/${id}/estimate-file`,
  estimate: (id: number | string) => `${BASE}/${id}/estimate`,
  sendEstimateEmail: (id: number | string) => `${BASE}/${id}/send-estimate-email`,
  revertToLead: (id: number | string) => `${BASE}/${id}/revert-to-lead`,
  payments: (id: number | string) => `${BASE}/${id}/payments`,
  qboReport: (id: number | string) => `${BASE}/${id}/qbo-report`,
  costBreakdown: (id: number | string) => `${BASE}/${id}/cost-breakdown`,
  quickbooksImportJobs: () => `${BASE}/quickbooks-import/jobs`,
  quickbooksImportBatch: () => `${BASE}/quickbooks-import/import-batch`,
  quickbooksImportDeactivateJob: () => `${BASE}/quickbooks-import/deactivate-job`,
} as const;

