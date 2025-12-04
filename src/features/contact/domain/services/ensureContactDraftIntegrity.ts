import { BusinessRuleError } from "@/shared/domain";
import {
  countDigits,
  isValidEmail,
  normalizeText,
} from "@/shared/validation";
import type { ContactDraft, ContactDraftPolicies } from "../models";

export function ensureContactDraftIntegrity(
  draft: ContactDraft,
  policies: ContactDraftPolicies = {}
): void {
  const name = normalizeText(draft.name);
  if (!name) {
    throw new BusinessRuleError(
      "VALIDATION_ERROR",
      "Contact name cannot be empty",
      { details: { field: "name" } }
    );
  }
  if (policies.maxNameLength && name.length > policies.maxNameLength) {
    throw new BusinessRuleError(
      "VALIDATION_ERROR",
      `Contact name must not exceed ${policies.maxNameLength} characters`,
      { details: { field: "name", length: name.length } }
    );
  }

  const email = normalizeText(draft.email);
  if (email && !isValidEmail(email)) {
    throw new BusinessRuleError(
      "VALIDATION_ERROR",
      "Email format is invalid",
      { details: { field: "email", value: email } }
    );
  }

  const phone = normalizeText(draft.phone);
  if (phone) {
    const digits = countDigits(phone);
    const minDigits = policies.minPhoneDigits ?? 0;
    if (minDigits > 0 && digits < minDigits) {
      throw new BusinessRuleError(
        "VALIDATION_ERROR",
        `Phone must have at least ${minDigits} digits`,
        { details: { field: "phone", digits } }
      );
    }
  }

  if (policies.requireAtLeastOneReach && !email && !phone) {
    throw new BusinessRuleError(
      "VALIDATION_ERROR",
      "At least one contact method (email or phone) is required",
      { details: { field: "global" } }
    );
  }
}
