import type { Contact, ContactPatch } from "../models";
import { normalizeEmptyToUndefined } from "@/shared/mappers";
import { createPatch, trimStringFields } from "@/shared/utils";

export type ContactFormValue = {
  name: string;
  phone: string;
  email: string;
  occupation: string;
  address: string;
  isCustomer: boolean;
  isClient: boolean;
  companyId: number | null;
  note?: string;
};

/**
 * Builds a standardized patch for contact updates
 * - Trims all string fields
 * - Normalizes empty strings to undefined for optional fields
 * - Only includes changed fields
 * 
 * @param current - Current contact state
 * @param value - Updated form values
 * @returns Patch with only changed fields
 */
export function toContactPatch(current: Contact, value: ContactFormValue): ContactPatch {
  // Trim string fields
  const trimmed = trimStringFields(value);
  
  // Prepare normalized updates matching Contact shape
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

  // Create patch with normalizers for optional fields
  const patch = createPatch(current, updates, {
    phone: normalizeEmptyToUndefined,
    email: normalizeEmptyToUndefined,
    occupation: normalizeEmptyToUndefined,
    address: normalizeEmptyToUndefined,
  });
  
  return patch as ContactPatch;
}
