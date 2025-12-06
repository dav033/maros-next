import type { Company, CompanyDraft, CompanyPatch } from "../../domain/models";
import type { CompanyFormValue } from "../molecules/CompanyForm";
import { CompanyType } from "../../domain/models";
import { normalizeEmptyToUndefined } from "@/shared/mappers";
import { createPatch, trimStringFields } from "@/shared/utils";
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

/**
 * Converts form values to a draft for company creation
 * Applies trimming and normalization
 */
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

/**
 * Builds a standardized patch for company updates
 * - Trims all string fields
 * - Normalizes empty strings to undefined
 * - Only includes changed fields
 * 
 * @param current - Current company state
 * @param value - Updated form values
 * @returns Patch with only changed fields
 */
export function toPatch(current: Company, value: CompanyFormValue): CompanyPatch {
  // Trim string fields
  const trimmed = trimStringFields(value);
  
  // Prepare normalized updates matching Company shape
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

  // Create patch with normalizers for optional fields
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
