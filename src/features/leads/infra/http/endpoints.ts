import { api, buildCrudEndpoints } from "@/shared/infra";

const BASE = api.resource("leads");

export const endpoints = {
  ...buildCrudEndpoints<number>(BASE),
  listByType: () => `${BASE}/type`,
  validateLeadNumber: () => `${BASE}/validate/lead-number`,
  createWithNewContact: () => `${BASE}/new-contact`,
  createWithExistingContact: () => `${BASE}/existing-contact`,
  getByLeadNumber: (leadNumber: string) => `${BASE}/number/${encodeURIComponent(leadNumber)}`,
} as const;
