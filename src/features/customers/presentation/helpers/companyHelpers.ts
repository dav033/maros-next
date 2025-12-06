import type { Company, CompanyPatch } from "@/company/domain";
import type { Contact } from "@/contact/domain";
import type { CompanyFormValue } from "@/features/company/presentation/molecules/CompanyForm";
import { normalizeEmptyToUndefined } from "@/shared/mappers";
import { createPatch, trimStringFields } from "@/shared/utils";

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

export function toCompanyPatch(
  current: Company,
  value: CompanyFormValue
): CompanyPatch {
  const trimmed = trimStringFields(value);

  const updates: Partial<Company> = {
    name: trimmed.name,
    address: normalizeEmptyToUndefined(trimmed.address),
    type: trimmed.type ?? undefined,
    serviceId: trimmed.serviceId,
    isCustomer: trimmed.isCustomer,
    isClient: trimmed.isClient,
    notes: trimmed.notes,
  };

  const patch = createPatch(current, updates, {
    address: normalizeEmptyToUndefined,
  });

  return patch as CompanyPatch;
}

export function mapCompanyToFormValue(
  company: Company,
  contacts: Contact[]
): CompanyFormValue {
  const companyContactIds = contacts
    .filter((contact) => contact.companyId === company.id)
    .map((contact) => contact.id)
    .filter((id): id is number => typeof id === "number");

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
