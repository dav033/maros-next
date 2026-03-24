import { unstable_cache } from "next/cache";
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

async function fetchCompaniesData(): Promise<CompaniesPageData> {
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

export const loadCompaniesData = unstable_cache(
  fetchCompaniesData,
  ["companies-page-data"],
  { revalidate: 60 }
);
