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
import type { Clock, ISODate } from "@/shared/domain";
import { BusinessRuleError } from "@/shared/domain";

import { ensureLeadDraftIntegrity } from "./ensureLeadDraftIntegrity";
import {
  ensureNewContactMinimums,
  normalizeNewContact,
} from "./leadContactLinkPolicy";
import { makeLeadNumber } from "./leadNumberPolicy";
import { normalizeText } from "@/shared/validation";

type CommonInput = Readonly<{
  leadNumber?: string | null;
  leadName?: string;
  location: string;
  projectTypeId: ProjectTypeId;
  leadType?: LeadType; // Opcional: solo para generar número si no se proporciona (no se almacena)
}>;

function validateLeadName(raw: string | undefined, location: string, leadNumber: string | null): string {
  let v = normalizeText(raw ?? "");
  
  if (!v) {
    const normalizedLocation = normalizeText(location);
    if (!normalizedLocation) {
      throw new BusinessRuleError(
        "VALIDATION_ERROR",
        "Location is required when lead name is not provided",
        { details: { field: "location" } }
      );
    }
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
    contactId: input.contactId,
  };

  ensureLeadDraftIntegrity(draft, policies);
  return draft;
}
