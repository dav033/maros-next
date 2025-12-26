import { serverApiClient } from "@/shared/infra/http";
import { ContactHttpRepository, makeContactsAppContext } from "@/contact";
import { listContacts } from "@/contact/application";
import { CompanyHttpRepository, makeCompanyAppContext } from "@/company";
import { companyCrudUseCases } from "@/company/application";
import type { Contact } from "@/contact/domain";
import type { Company } from "@/company";

export interface CustomersPageData {
  contacts: Contact[];
  companies: Company[];
}

export async function loadCustomersData(): Promise<CustomersPageData> {
  const contactsCtx = makeContactsAppContext({
    repos: {
      contact: new ContactHttpRepository(serverApiClient),
    },
  });

  const { CompanyServiceHttpRepository } = await import("@/company");
  const companyCtx = makeCompanyAppContext({
    repos: {
      company: new CompanyHttpRepository(serverApiClient),
      companyService: new CompanyServiceHttpRepository(serverApiClient),
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

