import type { Contact, ContactIntegrityPolicies } from "../models";
import { BusinessRuleError } from "@/shared/domain";
import {
  countDigits,
  isValidEmail,
  normalizeText,
} from "@/shared/validation";

export function ensureContactIntegrity(
  contact: Contact,
  policies: ContactIntegrityPolicies = {}
): void {
  const id = contact.id ?? 0;
  if (!Number.isFinite(id) || id <= 0) {
    throw new BusinessRuleError(
      "INTEGRITY_VIOLATION",
      "Contact id must be a positive number",
      { details: { field: "id", value: contact.id } }
    );
  }

  const name = normalizeText(contact.name);
  if (!name) {
    throw new BusinessRuleError(
      "INTEGRITY_VIOLATION",
      "Contact name cannot be empty",
      { details: { field: "name" } }
    );
  }
  if (policies.maxNameLength && name.length > policies.maxNameLength) {
    throw new BusinessRuleError(
      "INTEGRITY_VIOLATION",
      `Contact name must not exceed ${policies.maxNameLength} characters`,
      { details: { field: "name", length: name.length } }
    );
  }

  const email = normalizeText(contact.email);
  if (email && !isValidEmail(email)) {
    throw new BusinessRuleError(
      "INTEGRITY_VIOLATION",
      "Email format is invalid",
      { details: { field: "email", value: email } }
    );
  }

  const phone = normalizeText(contact.phone);
  if (phone) {
    const digits = countDigits(phone);
    const minDigits = policies.minPhoneDigits ?? 0;
    if (minDigits > 0 && digits < minDigits) {
      throw new BusinessRuleError(
        "INTEGRITY_VIOLATION",
        `Phone must have at least ${minDigits} digits`,
        { details: { field: "phone", digits } }
      );
    }
  }
}

export function isContactIntegrityOK(
  contact: Contact,
  policies: ContactIntegrityPolicies = {}
): boolean {
  try {
    ensureContactIntegrity(contact, policies);
    return true;
  } catch {
    return false;
  }
}
