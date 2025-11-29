import { api, buildCrudEndpoints } from "@/shared";

const BASE = api.resource("leads");

export const endpoints = {
  ...buildCrudEndpoints<number>(BASE),
  listByType: (type: string) => `${BASE}/type?type=${encodeURIComponent(type)}`,
  validateLeadNumber: (leadNumber: string) =>
    `${BASE}/validate/lead-number?leadNumber=${encodeURIComponent(leadNumber)}`,
  createWithNewContact: () => `${BASE}/new-contact`,
  createWithExistingContact: () => `${BASE}/existing-contact`,
} as const;
