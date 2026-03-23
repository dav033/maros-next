import { api, buildCrudEndpoints } from "@/shared/infra";

const BASE = api.resource("leads");

export const endpoints = {
  ...buildCrudEndpoints<number>(BASE),
  listByType: () => `${BASE}/type`,
  listInReview: () => `${BASE}/review`,
  validateLeadNumber: () => `${BASE}/validate/lead-number`,
  createWithNewContact: () => `${BASE}/new-contact`,
  createWithExistingContact: () => `${BASE}/existing-contact`,
  getByLeadNumber: (leadNumber: string) => `${BASE}/number/${encodeURIComponent(leadNumber)}`,
  getRejectionInfo: (id: number) => `${BASE}/${id}/rejection-info`,
  details: (id: number | string) => `${BASE}/${id}/details`,
} as const;
