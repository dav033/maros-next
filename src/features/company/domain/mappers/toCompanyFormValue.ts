import type { Company } from "../models";
import type { CompanyFormValue } from "../../presentation/components/CompanyForm";
import type { Contact } from "@/contact";

export function toCompanyFormValue(company: Company, contacts: Contact[] = []): CompanyFormValue {
  const companyContactIds = contacts
    .filter((contact) => contact.companyId === company.id)
    .map((contact) => contact.id);
  
  return {
    name: company.name,
    address: company.address ?? "",
    type: company.type,
    serviceId: company.serviceId ?? null,
    isCustomer: company.isCustomer,
    isClient: company.isClient,
    contactIds: companyContactIds,
    notes: company.notes ?? [],
  };
}
