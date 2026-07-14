import { api, buildCrudEndpoints } from "@/shared/infra/rest";

const BASE = api.resource("projects");

export const endpoints = {
  ...buildCrudEndpoints<number>(BASE, {
    listPath: "/all",
  }),
  details: (id: number | string) => `${BASE}/${id}/details`,
  estimateFile: (id: number | string) => `${BASE}/${id}/estimate-file`,
  estimate: (id: number | string) => `${BASE}/${id}/estimate`,
  sendEstimateEmail: (id: number | string) => `${BASE}/${id}/send-estimate-email`,
  revertToLead: (id: number | string) => `${BASE}/${id}/revert-to-lead`,
} as const;

