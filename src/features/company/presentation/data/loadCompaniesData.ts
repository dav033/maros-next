import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { CompanyHttpRepository, CompanyServiceHttpRepository, makeCompanyAppContext } from "@/company";
import { companyCrudUseCases, companyServiceCrudUseCases } from "@/company/application";
import { ContactHttpRepository, makeContactsAppContext } from "@/contact";
import { listContacts } from "@/contact/application";
import type { Company, CompanyService } from "@/company";
import type { Contact } from "@/contact/domain";

export interface CompaniesPageData {
  companies: Company[];
  contacts: Contact[];
  services: CompanyService[];
}

/**
 * Not wrapped in `unstable_cache` any more — see loadContactsData for why: the
 * cookieless singleton made every one of these calls 401, and the caching then
 * pinned the resulting empty lists for a minute.
 */
export async function loadCompaniesData(): Promise<CompaniesPageData> {
  const apiClient = createServerApiClient(await headers());
  const companyCtx = makeCompanyAppContext({
    repos: {
      company: new CompanyHttpRepository(apiClient),
      companyService: new CompanyServiceHttpRepository(apiClient),
    },
  });

  const contactsCtx = makeContactsAppContext({
    repos: {
      contact: new ContactHttpRepository(apiClient),
    },
  });

  const [companies, services, contacts] = await Promise.all([
    companyCrudUseCases.list(companyCtx)().catch(() => []),
    companyServiceCrudUseCases.list(companyCtx)().catch(() => []),
    listContacts(contactsCtx).catch(() => []),
  ]);

  return {
    companies: companies ?? [],
    services: services ?? [],
    contacts: contacts ?? [],
  };
}
