import type { LeadDraft, LeadDraftWithExistingContact, LeadDraftWithNewContact, LeadPolicies } from "../models";
import { BusinessRuleError } from "@/shared/domain";

import { ensureNewContactMinimums } from "./leadContactLinkPolicy";
import { normalizeText, isIsoLocalDate, coerceIsoLocalDate } from "@/shared/validation";

export function ensureLeadDraftIntegrity(
  draft: LeadDraft,
  policies: LeadPolicies = {}
): void {
  const name = normalizeText((draft as unknown as Record<string, unknown>)["name"]);
  if (name && name.length > 140) {
    throw new BusinessRuleError("FORMAT_ERROR", "Lead name max length is 140", {
      details: { field: "name", length: name.length },
    });
  }
  // startDate es requerido en LeadDraft y debe estar en formato YYYY-MM-DD
  const startDateValue = (draft as unknown as Record<string, unknown>)["startDate"];
  if (!startDateValue) {
    throw new BusinessRuleError(
      "VALIDATION_ERROR",
      "startDate is required",
      { details: { field: "startDate" } }
    );
  }
  
  const sd = normalizeText(String(startDateValue));
  if (!sd) {
    throw new BusinessRuleError(
      "VALIDATION_ERROR",
      "startDate cannot be empty",
      { details: { field: "startDate" } }
    );
  }
  
  // Intentar normalizar el valor si no está en formato correcto
  let normalizedDate: string;
  try {
    normalizedDate = coerceIsoLocalDate(sd);
  } catch {
    throw new BusinessRuleError(
      "FORMAT_ERROR",
      "startDate must be in YYYY-MM-DD format",
      { details: { field: "startDate", value: startDateValue } }
    );
  }
  
  if (!isIsoLocalDate(normalizedDate)) {
    throw new BusinessRuleError(
      "FORMAT_ERROR",
      "startDate must be in YYYY-MM-DD format",
      { details: { field: "startDate", value: startDateValue } }
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
