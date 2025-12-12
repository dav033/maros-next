import type { Company, CompanyPatch } from "../models";
import { normalizeEmptyToUndefined } from "@/shared/mappers";
import type { CompanyFormValue } from "../../presentation/molecules/CompanyForm";

export function toCompanyPatch(current: Company, value: CompanyFormValue): CompanyPatch {
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
  if (normalizeEmptyToUndefined(value.addressLink) !== normalizeEmptyToUndefined(current.addressLink)) {
    patch.addressLink = normalizeEmptyToUndefined(value.addressLink);
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
  if (normalizeEmptyToUndefined(value.phone) !== normalizeEmptyToUndefined(current.phone)) {
    patch.phone = normalizeEmptyToUndefined(value.phone);
  }
  if (normalizeEmptyToUndefined(value.email) !== normalizeEmptyToUndefined(current.email)) {
    patch.email = normalizeEmptyToUndefined(value.email);
  }
  if (normalizeEmptyToUndefined(value.submiz) !== normalizeEmptyToUndefined(current.submiz)) {
    patch.submiz = normalizeEmptyToUndefined(value.submiz);
  }

  return patch as CompanyPatch;
}
