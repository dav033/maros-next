import type { CompanyAppContext } from "@/company";
import { makeCompanyAppContext, CompanyHttpRepository, CompanyServiceHttpRepository } from "@/company";


export function createCompanyAppContext(): CompanyAppContext {
  return makeCompanyAppContext({
    repos: {
      company: new CompanyHttpRepository(),
      companyService: new CompanyServiceHttpRepository(),
    },
  });
}
