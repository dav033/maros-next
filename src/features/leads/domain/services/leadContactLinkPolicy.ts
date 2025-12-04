import type { ContactId, NewContact } from "../models";
import { BusinessRuleError } from "@/shared/domain";
import { normalizeText } from "@/shared/validation";

export function normalizeNewContact(input: NewContact): NewContact {
  return {
    companyName: normalizeText(input.companyName),
    name: normalizeText(input.name),
    phone: normalizeText(input.phone),
    email: normalizeText(input.email),
  };
}

export function ensureNewContactMinimums(contact: NewContact): void {
  if (!contact.name) {
    throw new BusinessRuleError("VALIDATION_ERROR", "Contact name must not be empty", {
      details: { field: "contact.name" },
    });
  }
  if (!contact.email) {
    throw new BusinessRuleError("VALIDATION_ERROR", "Contact email must not be empty", {
      details: { field: "contact.email" },
    });
  }
}

export function ensureExclusiveContactLink(args: {
  contact?: NewContact;
  contactId?: ContactId;
}): void {
  const hasNew = !!args.contact;
  const hasId = args.contactId !== undefined && args.contactId !== null;

  if (hasNew && hasId) {
    throw new BusinessRuleError("INTEGRITY_VIOLATION", "Provide either contact or contactId, not both", {
      details: { fields: ["contact", "contactId"] },
    });
  }
  if (!hasNew && !hasId) {
    throw new BusinessRuleError("VALIDATION_ERROR", "Either contact or contactId must be provided", {
      details: { fields: ["contact", "contactId"] },
    });
  }
}

export type ContactLink =
  | Readonly<{ kind: "new"; contact: NewContact }>
  | Readonly<{ kind: "existing"; contactId: ContactId }>;

export function resolveContactLink(args: { contact?: NewContact; contactId?: ContactId }): ContactLink {
  ensureExclusiveContactLink(args);

  if (args.contact) {
    const normalized = normalizeNewContact(args.contact);
    ensureNewContactMinimums(normalized);
    return { kind: "new", contact: normalized };
  }
  return { kind: "existing", contactId: args.contactId as ContactId };
}
