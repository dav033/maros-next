import type { ISODate } from "@/shared/domain";
import type { LeadDraft } from "@/leads/domain";
import type { LeadStatus, LeadType } from "@/leads/domain";

type CreateLeadBasePayload = {
  leadNumber: string | null;
  name: string;
  startDate: ISODate;
  location: string;
  status: LeadStatus | null;
  projectTypeId: number;
  leadType: LeadType;
};

type CreateLeadWithNewContactPayload = CreateLeadBasePayload & {
  contact: {
    companyName: string;
    name: string;
    phone: string;
    email: string;
  };
};

type CreateLeadWithExistingContactPayload = CreateLeadBasePayload & {
  contactId: number;
};

export type CreateLeadPayload =
  | CreateLeadWithNewContactPayload
  | CreateLeadWithExistingContactPayload;

export function mapLeadDraftToCreatePayload(
  draft: LeadDraft
): CreateLeadPayload {
  const base: CreateLeadBasePayload = {
    leadNumber: draft.leadNumber,
    name: draft.name,
    startDate: draft.startDate,
    location: draft.location,
    status: draft.status,
    projectTypeId: draft.projectTypeId,
    leadType: draft.leadType,
  };

  if ("contact" in draft) {
    return {
      ...base,
      contact: {
        companyName: draft.contact.companyName,
        name: draft.contact.name,
        phone: draft.contact.phone,
        email: draft.contact.email,
      },
    };
  }

  return {
    ...base,
    contactId: draft.contactId,
  };
}
