import type { Contact, ContactPatch, ContactFormValue } from "@/contact";
import { normalizeEmptyToUndefined } from "@/shared";

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
  const trimmedName = value.name.trim();
  const normalizedPhone = normalizeEmptyToUndefined(value.phone);
  const normalizedEmail = normalizeEmptyToUndefined(value.email);
  const normalizedOccupation = normalizeEmptyToUndefined(value.occupation);
  const normalizedAddress = normalizeEmptyToUndefined(value.address);
  
  const currentPhone = normalizeEmptyToUndefined(current.phone);
  const currentEmail = normalizeEmptyToUndefined(current.email);
  const currentOccupation = normalizeEmptyToUndefined(current.occupation);
  const currentAddress = normalizeEmptyToUndefined(current.address);
  
  const patch: Partial<Contact> = {};

  if (trimmedName !== current.name) {
    patch.name = trimmedName;
  }
  if (normalizedPhone !== currentPhone) {
    patch.phone = normalizedPhone;
  }
  if (normalizedEmail !== currentEmail) {
    patch.email = normalizedEmail;
  }
  if (normalizedOccupation !== currentOccupation) {
    patch.occupation = normalizedOccupation;
  }
  if (normalizedAddress !== currentAddress) {
    patch.address = normalizedAddress;
  }
  if (value.isCustomer !== current.isCustomer) {
    patch.isCustomer = value.isCustomer;
  }
  if (value.isClient !== current.isClient) {
    patch.isClient = value.isClient;
  }
  if (value.companyId !== (current.companyId ?? null)) {
    patch.companyId = value.companyId;
  }

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
