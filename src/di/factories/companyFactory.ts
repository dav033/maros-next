import type { CompanyAppContext } from "@/company";
import { makeCompanyAppContext, CompanyHttpRepository, CompanyServiceHttpRepository } from "@/company";

/**
 * Factory for creating the Company application context.
 * Encapsulates all company-related dependencies including services.
 */
export function createCompanyAppContext(): CompanyAppContext {
  return makeCompanyAppContext({
    repos: {
      company: new CompanyHttpRepository(),
      companyService: new CompanyServiceHttpRepository(),
    },
  });
}
