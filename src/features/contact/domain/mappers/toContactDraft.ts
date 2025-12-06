import type { ContactDraft } from "../models";
import type { ContactFormValue } from "./toContactPatch";
import type { ContactRole } from "../ContactRole";
import { normalizeEmptyToUndefined } from "@/shared/mappers/dto";

export function toContactDraft(value: ContactFormValue): ContactDraft {
  return {
    name: value.name.trim(),
    phone: normalizeEmptyToUndefined(value.phone),
    email: normalizeEmptyToUndefined(value.email),
    occupation: normalizeEmptyToUndefined(value.occupation),
    role: value.role ? (value.role as ContactRole) : undefined,
    addressLink: normalizeEmptyToUndefined(value.addressLink),
    address: normalizeEmptyToUndefined(value.address),
    isCustomer: value.isCustomer,
    isClient: value.isClient,
    companyId: value.companyId,
    notes: value.note?.trim() ? [value.note.trim()] : null,
  };
}
