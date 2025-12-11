import type { Contact, ContactPatch } from "../models";
import { normalizeEmptyToUndefined } from "@/shared/mappers";
import { createPatch, trimStringFields } from "@dav033/dav-components";

import type { ContactRole } from "../ContactRole";

export type ContactFormValue = {
  name: string;
  phone: string;
  email: string;
  occupation: string;
  role?: string | undefined;
  addressLink?: string | undefined;
  address: string;
  isCustomer: boolean;
  isClient: boolean;
  companyId: number | null;
  note?: string;
};


export function toContactPatch(current: Contact, value: ContactFormValue): ContactPatch {
 
  const trimmed = trimStringFields(value);
  
 
  const updates: Partial<Contact> = {
    name: trimmed.name,
    phone: normalizeEmptyToUndefined(trimmed.phone),
    email: normalizeEmptyToUndefined(trimmed.email),
    occupation: normalizeEmptyToUndefined(trimmed.occupation),
    role: trimmed.role ? (trimmed.role as ContactRole) : undefined,
    address: normalizeEmptyToUndefined(trimmed.address),
    addressLink: normalizeEmptyToUndefined(trimmed.addressLink),
    isCustomer: trimmed.isCustomer,
    isClient: trimmed.isClient,
    companyId: trimmed.companyId,
  };

 
  const patch = createPatch(current, updates, {
    phone: normalizeEmptyToUndefined,
    email: normalizeEmptyToUndefined,
    occupation: normalizeEmptyToUndefined,
    address: normalizeEmptyToUndefined,
    addressLink: normalizeEmptyToUndefined,
    role: (val: any) => val || null,
  });
  
  return patch as ContactPatch;
}
