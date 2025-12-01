import type { Company, CompanyDraft, CompanyPatch } from "../../domain/models";
import type { CompanyFormValue } from "../components/CompanyForm";
import { CompanyType } from "../../domain/models";
import { normalizeEmptyToUndefined } from "@/shared";
import type { Contact } from "@/contact";

export const initialCompanyFormValue: CompanyFormValue = {
  name: "",
  address: "",
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
    type: value.type ?? CompanyType.OTHER,
    serviceId: value.serviceId,
    isCustomer: value.isCustomer,
    isClient: value.isClient,
  };
}

export function toPatch(current: Company, value: CompanyFormValue): CompanyPatch {
  const trimmedName = value.name.trim();
  const normalizedAddress = normalizeEmptyToUndefined(value.address);
  const currentAddress = normalizeEmptyToUndefined(current.address);

  const patch: Partial<Company> = {};

  if (trimmedName !== current.name) {
    patch.name = trimmedName;
  }
  if (normalizedAddress !== currentAddress) {
    patch.address = normalizedAddress;
  }
  if (value.type !== current.type && value.type != null) {
    patch.type = value.type;
  }
  if (value.serviceId !== current.serviceId) {
    patch.serviceId = value.serviceId;
  }
  if (value.isCustomer !== current.isCustomer) {
    patch.isCustomer = value.isCustomer;
  }
  if (value.isClient !== current.isClient) {
    patch.isClient = value.isClient;
  }

  if (Array.isArray(value.notes)) {
    patch.notes = value.notes;
  }
  
  return patch as CompanyPatch;
}

export function mapCompanyToFormValue(company: Company, contacts: Contact[]): CompanyFormValue {
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
