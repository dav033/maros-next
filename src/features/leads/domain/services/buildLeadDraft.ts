import type {
  ContactId,
  LeadDraftWithExistingContact,
  LeadDraftWithNewContact,
  LeadPolicies,
  LeadStatus,
  LeadType,
  NewContact,
  ProjectTypeId,
} from "../models";
import type { Clock, ISODate } from "@/shared";
import { BusinessRuleError } from "@/shared";

import { ensureLeadDraftIntegrity } from "./ensureLeadDraftIntegrity";
import {
  ensureNewContactMinimums,
  normalizeNewContact,
} from "./leadContactLinkPolicy";
import { makeLeadNumber } from "./leadNumberPolicy";

type CommonInput = Readonly<{
  leadNumber?: string | null;
  leadName?: string;
  location: string;
  projectTypeId: ProjectTypeId;
  leadType: LeadType;
}>;

function normalizeText(s: string): string {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function validateLeadName(raw: string | undefined, location: string, leadNumber: string | null): string {
  let v = normalizeText(raw ?? "");
  
  // Allow empty name, will be auto-generated on backend: {leadNumber}-{location}
  if (!v) {
    const normalizedLocation = normalizeText(location);
    if (!normalizedLocation) {
      throw new BusinessRuleError(
        "VALIDATION_ERROR",
        "Location is required when lead name is not provided",
        { details: { field: "location" } }
      );
    }
    // Return empty string, backend will generate the name
    return "";
  }
  
  if (v.length > 140) {
    throw new BusinessRuleError("FORMAT_ERROR", "Lead name max length is 140", {
      details: { field: "leadName", length: v.length },
    });
  }
  return v;
}

export function buildLeadDraftForNewContact(
  clock: Clock,
  input: CommonInput & { contact: NewContact },
  policies: LeadPolicies = {}
): LeadDraftWithNewContact {
  const numberRules = policies.leadNumberPattern
    ? { pattern: policies.leadNumberPattern }
    : undefined;
  const leadNumber = makeLeadNumber(input.leadNumber, numberRules);
  
  const name = validateLeadName(input.leadName, input.location, leadNumber);

  const normalizedContact = normalizeNewContact(input.contact);
  ensureNewContactMinimums(normalizedContact);

  const draft: LeadDraftWithNewContact = {
    leadNumber,
    name,
    startDate: clock.todayISO() as ISODate,
    location: normalizeText(input.location),
    status: ((policies as any).defaultStatus ?? null) as LeadStatus | null,
    projectTypeId: input.projectTypeId,
    leadType: input.leadType,
    contact: normalizedContact,
  };

  ensureLeadDraftIntegrity(draft, policies);
  return draft;
}

export function buildLeadDraftForExistingContact(
  clock: Clock,
  input: CommonInput & { contactId: ContactId },
  policies: LeadPolicies = {}
): LeadDraftWithExistingContact {
  const numberRules = policies.leadNumberPattern
    ? { pattern: policies.leadNumberPattern }
    : undefined;
  const leadNumber = makeLeadNumber(input.leadNumber, numberRules);
  
  const name = validateLeadName(input.leadName, input.location, leadNumber);

  const draft: LeadDraftWithExistingContact = {
    leadNumber,
    name,
    startDate: clock.todayISO() as ISODate,
    location: normalizeText(input.location),
    status: ((policies as any).defaultStatus ?? null) as LeadStatus | null,
    projectTypeId: input.projectTypeId,
    leadType: input.leadType,
    contactId: input.contactId,
  };

  ensureLeadDraftIntegrity(draft, policies);
  return draft;
}
