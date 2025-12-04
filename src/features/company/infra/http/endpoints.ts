import { api, buildCrudEndpoints } from "@/shared/infra";

const COMPANIES_BASE = api.resource("companies");
const COMPANY_SERVICES_BASE = api.resource("company-services");

export const companyEndpoints = {
  ...buildCrudEndpoints<number>(COMPANIES_BASE, { listPath: "/all" }),
  assignContacts: (companyId: number) => `${COMPANIES_BASE}/${companyId}/contacts`,
} as const;

export const companyServiceEndpoints = {
  ...buildCrudEndpoints<number>(COMPANY_SERVICES_BASE, { listPath: "/all" }),
} as const;
