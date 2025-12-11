import type { Company, CompanyDraft, CompanyPatch } from "../../domain/models";
import type { CompanyFormValue } from "../molecules/CompanyForm";
import { CompanyType } from "../../domain/models";
import { normalizeEmptyToUndefined } from "@/shared/mappers";
import { createPatch, trimStringFields } from "@dav033/dav-components";
import type { Contact } from "@/contact/domain";

export const initialCompanyFormValue: CompanyFormValue = {
  name: "",
  address: "",
  addressLink: "",
  type: null,
  serviceId: null,
  isCustomer: false,
  isClient: false,
  contactIds: [],
  notes: [],
};


export function toDraft(value: CompanyFormValue): CompanyDraft {
  return {
    name: value.name.trim(),
    address: normalizeEmptyToUndefined(value.address),
    addressLink: normalizeEmptyToUndefined(value.addressLink),
    type: value.type ?? CompanyType.OTHER,
    serviceId: value.serviceId,
    isCustomer: value.isCustomer,
    isClient: value.isClient,
  };
}


export function toPatch(current: Company, value: CompanyFormValue): CompanyPatch {
 
  const trimmed = trimStringFields(value);
  
 
  const updates: Partial<Company> = {
    name: trimmed.name,
    address: normalizeEmptyToUndefined(trimmed.address),
    addressLink: normalizeEmptyToUndefined(trimmed.addressLink),
    type: trimmed.type ?? undefined,
    serviceId: trimmed.serviceId,
    isCustomer: trimmed.isCustomer,
    isClient: trimmed.isClient,
    notes: trimmed.notes,
  };

 
  const patch = createPatch(current, updates, {
    address: normalizeEmptyToUndefined,
    addressLink: normalizeEmptyToUndefined,
  });
  
  return patch as CompanyPatch;
}

export function mapCompanyToFormValue(company: Company, contacts: Contact[]): CompanyFormValue {
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
