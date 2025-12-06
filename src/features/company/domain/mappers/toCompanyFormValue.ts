import type { Company } from "../models";
import type { CompanyFormValue } from "../../presentation/molecules/CompanyForm";
import type { Contact } from "@/contact";

export function toCompanyFormValue(company: Company, contacts: Contact[] = []): CompanyFormValue {
  const companyContactIds = contacts
    .filter((contact) => contact.companyId === company.id)
    .map((contact) => contact.id)
    .filter((id): id is number => typeof id === "number");
  
  return {
    name: company.name,
    address: company.address ?? "",
    addressLink: company.addressLink ?? "",
    type: company.type,
    serviceId: company.serviceId ?? null,
    isCustomer: company.isCustomer,
    isClient: company.isClient,
    contactIds: companyContactIds,
    notes: company.notes ?? [],
  };
}
