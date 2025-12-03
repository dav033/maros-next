import type { Contact, ContactPatch, ContactFormValue } from "@/contact";
import { normalizeEmptyToUndefined, createPatch, trimStringFields } from "@/shared";

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

/**
 * Builds a standardized patch for contact updates in Customers context
 * - Trims all string fields
 * - Normalizes empty strings to undefined for optional fields
 * - Only includes changed fields
 */
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
