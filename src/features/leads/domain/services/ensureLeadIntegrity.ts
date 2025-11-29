
import { BusinessRuleError } from "@/shared";

import {
  type LeadNumberRules,
  normalizeLeadNumber,
  validateLeadNumberFormat,
} from "./leadNumberPolicy";
import { Lead, LeadStatus } from "../models";

const DEFAULT_STATUS_ORDER: readonly LeadStatus[] = [
  LeadStatus.NOT_EXECUTED,
  LeadStatus.COMPLETED,
  LeadStatus.IN_PROGRESS,
  LeadStatus.LOST,
  LeadStatus.POSTPONED,
  LeadStatus.PERMITS,
];

function normalizeText(s: unknown): string {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function isIsoLocalDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export type LeadIntegrityPolicies = Readonly<{
  leadNumberRules?: LeadNumberRules;
}>;

export function ensureLeadIntegrity(
  lead: Lead,
  policies: LeadIntegrityPolicies = {}
): void {
  // id obligatorio y positivo
  if (
    typeof lead.id !== "number" ||
    !Number.isFinite(lead.id) ||
    lead.id <= 0
  ) {
    throw new BusinessRuleError(
      "INTEGRITY_VIOLATION",
      "Lead.id must be a positive number",
      {
        details: { field: "id", value: lead.id },
      }
    );
  }

  // name obligatorio y con longitud máxima
  const name = normalizeText(lead.name);
  if (!name) {
    throw new BusinessRuleError(
      "VALIDATION_ERROR",
      "Lead name must not be empty",
      {
        details: { field: "name" },
      }
    );
  }
  if (name.length > 140) {
    throw new BusinessRuleError(
      "FORMAT_ERROR",
      "Lead name max length is 140",
      {
        details: { field: "name", length: name.length },
      }
    );
  }

  // startDate en formato YYYY-MM-DD (ISO local date)
  const sd = normalizeText(lead.startDate);
  if (!sd || !isIsoLocalDate(sd)) {
    throw new BusinessRuleError(
      "FORMAT_ERROR",
      "startDate must be in YYYY-MM-DD format",
      {
        details: { field: "startDate", value: lead.startDate },
      }
    );
  }

  /**
   * IMPORTANTE: aquí relajamos la validación para datos legacy.
   *
   * - Si projectType.id o contact.id vienen en 0 o null, los dejamos pasar.
   * - Solo lanzamos error si vienen con un valor claramente inválido (< 0 o NaN).
   */

  // Validación tolerante de projectType.id
  const projectTypeId = lead.projectType?.id;
  if (
    projectTypeId != null &&             // existe
    projectTypeId !== 0 &&               // permitimos 0 como "no definido" legacy
    (typeof projectTypeId !== "number" ||
      !Number.isFinite(projectTypeId) ||
      projectTypeId < 0)
  ) {
    throw new BusinessRuleError(
      "INTEGRITY_VIOLATION",
      "projectType.id must be a positive number",
      {
        details: { field: "projectType.id", value: projectTypeId },
      }
    );
  }

  // Validación tolerante de contact.id
  const contactId = lead.contact?.id;
  if (
    contactId != null &&                 // existe
    contactId !== 0 &&                   // permitimos 0 como "no definido" legacy
    (typeof contactId !== "number" ||
      !Number.isFinite(contactId) ||
      contactId < 0)
  ) {
    throw new BusinessRuleError(
      "INTEGRITY_VIOLATION",
      "contact.id must be a positive number",
      {
        details: { field: "contact.id", value: contactId },
      }
    );
  }

  // Status válido dentro del orden permitido
  const s = lead.status as LeadStatus | null | undefined;
  const effectiveStatus = (s ??
    ("NOT_EXECUTED" as LeadStatus)) as LeadStatus;
  if (!DEFAULT_STATUS_ORDER.includes(effectiveStatus)) {
    throw new BusinessRuleError("FORMAT_ERROR", "Invalid lead status", {
      details: { field: "status", value: lead.status },
    });
  }

  // Validación opcional de leadNumber según reglas
  if (typeof lead.leadNumber === "string") {
    const normalized = normalizeLeadNumber(
      lead.leadNumber,
      policies.leadNumberRules
    );
    if (policies.leadNumberRules) {
      validateLeadNumberFormat(normalized, policies.leadNumberRules);
    }
  }
}

export function isLeadIntegrityOK(
  lead: Lead,
  policies: LeadIntegrityPolicies = {}
): boolean {
  try {
    ensureLeadIntegrity(lead, policies);
    return true;
  } catch {
    return false;
  }
}
