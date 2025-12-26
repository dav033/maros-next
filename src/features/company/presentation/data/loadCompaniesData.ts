import { serverApiClient } from "@/shared/infra/http";
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

export async function loadCompaniesData(): Promise<CompaniesPageData> {
  // Create server-side contexts
  const companyCtx = makeCompanyAppContext({
    repos: {
      company: new CompanyHttpRepository(serverApiClient),
      companyService: new CompanyServiceHttpRepository(serverApiClient),
    },
  });

  const contactsCtx = makeContactsAppContext({
    repos: {
      contact: new ContactHttpRepository(serverApiClient),
    },
  });

  // Load data in parallel
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

