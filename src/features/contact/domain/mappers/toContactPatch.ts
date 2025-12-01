import type { Contact } from "../models";
import { normalizeEmptyToUndefined } from "@/shared";

export type ContactPatch = Partial<Contact>;

export type ContactFormValue = {
  name: string;
  phone: string;
  email: string;
  occupation: string;
  address: string;
  isCustomer: boolean;
  isClient: boolean;
  companyId: number | null;
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
