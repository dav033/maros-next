import { api } from "@/shared/infra";

const CRM_BASE = api.path("crm");

export const customersEndpoints = {
  getCustomers: () => `${CRM_BASE}/customers`,
} as const;
