import type { Contact, ContactPatch, ContactFormValue } from "@/contact/domain";
import { normalizeEmptyToUndefined } from "@/shared/mappers";
import { createPatch, trimStringFields } from "@dav033/dav-components";

export const initialContactFormValue: ContactFormValue = {
  name: "",
  phone: "",
  email: "",
  occupation: "",
  address: "",
  isCustomer: false,
  isClient: false,
  companyId: null,
};


export function toContactPatch(current: Contact, value: ContactFormValue): ContactPatch {
  const trimmed = trimStringFields(value);
  
  const updates: Partial<Contact> = {
    name: trimmed.name,
    phone: normalizeEmptyToUndefined(trimmed.phone),
    email: normalizeEmptyToUndefined(trimmed.email),
    occupation: normalizeEmptyToUndefined(trimmed.occupation),
    address: normalizeEmptyToUndefined(trimmed.address),
    isCustomer: trimmed.isCustomer,
    isClient: trimmed.isClient,
    companyId: trimmed.companyId,
  };

  const patch = createPatch(current, updates, {
    phone: normalizeEmptyToUndefined,
    email: normalizeEmptyToUndefined,
    occupation: normalizeEmptyToUndefined,
    address: normalizeEmptyToUndefined,
  });

  return patch as ContactPatch;
}

export function mapContactToFormValue(contact: Contact): ContactFormValue {
  return {
    name: contact.name,
    phone: contact.phone ?? "",
    email: contact.email ?? "",
    occupation: contact.occupation ?? "",
    address: contact.address ?? "",
    isCustomer: contact.isCustomer,
    isClient: contact.isClient,
    companyId: contact.companyId ?? null,
  };
}
