import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { ContactHttpRepository, makeContactsAppContext } from "@/contact";
import { listContacts } from "@/contact/application";
import { CompanyHttpRepository, CompanyServiceHttpRepository, makeCompanyAppContext } from "@/company";
import { companyCrudUseCases } from "@/company/application";
import type { Contact } from "@/contact/domain";
import type { Company } from "@/company";

export interface CustomersPageData {
  contacts: Contact[];
  companies: Company[];
}

/**
 * Not wrapped in `unstable_cache` any more — see loadContactsData for why: the
 * cookieless singleton made every one of these calls 401, and the caching then
 * pinned the resulting empty lists for a minute.
 */
export async function loadCustomersData(): Promise<CustomersPageData> {
  const apiClient = createServerApiClient(await headers());
  const contactsCtx = makeContactsAppContext({
    repos: {
      contact: new ContactHttpRepository(apiClient),
    },
  });

  const companyCtx = makeCompanyAppContext({
    repos: {
      company: new CompanyHttpRepository(apiClient),
      companyService: new CompanyServiceHttpRepository(apiClient),
    },
  });

  const [contacts, companies] = await Promise.all([
    listContacts(contactsCtx).catch(() => []),
    companyCrudUseCases.list(companyCtx)().catch(() => []),
  ]);

  return {
    contacts: contacts ?? [],
    companies: companies ?? [],
  };
}
