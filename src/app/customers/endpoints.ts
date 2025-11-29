import { api } from "@/shared";

const CRM_BASE = api.path("crm");

export const customersEndpoints = {
  getCustomers: () => `${CRM_BASE}/customers`,
} as const;

