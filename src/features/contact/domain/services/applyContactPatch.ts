import type { Contact, ContactDraftPolicies, ContactPatch, ApplyContactPatchResult } from "../models";
import { BusinessRuleError } from "@/shared/domain";
import {
  countDigits,
  isValidEmail,
  normalizeEmail,
  normalizePhone,
  normalizeText,
} from "@/shared/validation";

const DEFAULTS: ContactDraftPolicies = {
  maxNameLength: 200,
  minPhoneDigits: 7,
  requireAtLeastOneReach: true,
};

export function applyContactPatch(
  current: Contact,
  patch: ContactPatch,
  policies: ContactDraftPolicies = {}
): ApplyContactPatchResult {
  const cfg = { ...DEFAULTS, ...policies };
  let updated = { ...current };
  const changed: string[] = [];

  if (patch.name !== undefined) {
    const normalized = normalizeText(patch.name);
    if (!normalized) {
      throw new BusinessRuleError(
        "VALIDATION_ERROR",
        "Contact name must not be empty",
        { details: { field: "name" } }
      );
    }
    if (cfg.maxNameLength && normalized.length > cfg.maxNameLength) {
      throw new BusinessRuleError(
        "VALIDATION_ERROR",
        `Contact name must not exceed ${cfg.maxNameLength} characters`,
        { details: { field: "name", length: normalized.length } }
      );
    }
    if (normalizeText(current.name) !== normalized) {
      updated.name = normalized;
      changed.push("name");
    }
  }

  if (patch.email !== undefined) {
    const normalized = normalizeEmail(patch.email ?? undefined);
    if (normalized && !isValidEmail(normalized)) {
      throw new BusinessRuleError(
        "FORMAT_ERROR",
        "Email is not valid",
        { details: { field: "email", value: normalized } }
      );
    }
    const currentNormalized = normalizeEmail(current.email);
    if (currentNormalized !== normalized) {
      updated.email = normalized;
      changed.push("email");
    }
  }

  if (patch.phone !== undefined) {
    const normalized = normalizePhone(patch.phone ?? undefined);
    if (normalized) {
      const digits = countDigits(normalized);
      const minDigits = cfg.minPhoneDigits ?? 0;
      if (minDigits > 0 && digits < minDigits) {
        throw new BusinessRuleError(
          "FORMAT_ERROR",
          `Phone must contain at least ${minDigits} digits`,
          { details: { field: "phone", digits } }
        );
      }
    }
    const currentNormalized = normalizePhone(current.phone);
    if (currentNormalized !== normalized) {
      updated.phone = normalized;
      changed.push("phone");
    }
  }

  if (patch.occupation !== undefined) {
    const normalized = normalizeText(patch.occupation) || undefined;
    const currentNormalized = normalizeText(current.occupation) || undefined;
    if (currentNormalized !== normalized) {
      updated.occupation = normalized;
      changed.push("occupation");
    }
  }

  if (patch.address !== undefined) {
    const normalized = normalizeText(patch.address) || undefined;
    const currentNormalized = normalizeText(current.address) || undefined;
    if (currentNormalized !== normalized) {
      updated.address = normalized;
      changed.push("address");
    }
  }

  if (cfg.requireAtLeastOneReach && !updated.email && !updated.phone) {
    throw new BusinessRuleError(
      "VALIDATION_ERROR",
      "At least one reach method (email or phone) is required",
      { details: { field: "global" } }
    );
  }

  const events =
    changed.length > 0
      ? [
          {
            type: "ContactUpdated" as const,
            payload: { id: updated.id, changed },
          },
        ]
      : [];

  return { contact: updated, events };
}
