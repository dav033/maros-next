import type { LeadDraft, LeadDraftWithExistingContact, LeadDraftWithNewContact, LeadPolicies } from "../models";
import { BusinessRuleError } from "@/shared";

import { ensureNewContactMinimums } from "./leadContactLinkPolicy";

function normalizeText(s: unknown): string {
  return String(s ?? "").replace(/\s+/g, " ").trim();
}

function isIsoLocalDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function ensureLeadDraftIntegrity(
  draft: LeadDraft,
  policies: LeadPolicies = {}
): void {
  const name = normalizeText((draft as unknown as Record<string, unknown>)["name"]);
  // Allow empty name, will be auto-generated on backend
  if (name && name.length > 140) {
    throw new BusinessRuleError("FORMAT_ERROR", "Lead name max length is 140", {
      details: { field: "name", length: name.length },
    });
  }
  const sd = normalizeText((draft as unknown as Record<string, unknown>)["startDate"]);
  if (!sd || !isIsoLocalDate(sd)) {
    throw new BusinessRuleError(
      "FORMAT_ERROR",
      "startDate must be in YYYY-MM-DD format",
      { details: { field: "startDate", value: (draft as unknown as Record<string, unknown>)["startDate"] } }
    );
  }
  if ((draft as LeadDraftWithNewContact).contact) {
    ensureNewContactMinimums((draft as LeadDraftWithNewContact).contact);
  } else if ((draft as LeadDraftWithExistingContact).contactId != null) {
    const id = (draft as LeadDraftWithExistingContact).contactId;
    if (typeof id !== "number" || !Number.isFinite(id) || id <= 0) {
      throw new BusinessRuleError(
        "INTEGRITY_VIOLATION",
        "contactId must be a positive number",
        { details: { field: "contactId", value: id } }
      );
    }
  } else {
    throw new BusinessRuleError(
      "VALIDATION_ERROR",
      "Either contact or contactId must be provided",
      { details: { fields: ["contact", "contactId"] } }
    );
  }
  if (policies.leadNumberPattern && draft.leadNumber) {
    if (!policies.leadNumberPattern.test(draft.leadNumber)) {
      throw new BusinessRuleError("FORMAT_ERROR", "Lead number format is invalid", {
        details: { field: "leadNumber", value: draft.leadNumber },
      });
    }
  }
}

export function isLeadDraftIntegrityOK(
  draft: LeadDraft,
  policies: LeadPolicies = {}
): boolean {
  try {
    ensureLeadDraftIntegrity(draft, policies);
    return true;
  } catch {
    return false;
  }
}
