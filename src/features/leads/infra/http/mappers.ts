import type { ISODate } from "@/shared";
import type { Lead, LeadDraft, LeadPatch } from "@/leads";
export type ApiLeadDTO = {
  id: number;
  leadNumber: string;
  name: string;
  startDate: string;
  location: string;
  status: string;
  leadType: string;
  contactId?: number;
  projectTypeId?: number;
  notes?: string[];
};
import type { LeadStatus, LeadType } from "@/leads";
import { mapLeadFromDTO, mapLeadsFromDTO } from "@/leads";

export type CreateLeadBasePayload = {
  leadNumber: string | null;
  name: string;
  startDate: ISODate;
  location: string;
  status: LeadStatus | null;
  projectTypeId: number;
  leadType: LeadType;
  notesJson?: string;
};

export type CreateLeadWithNewContactPayload = CreateLeadBasePayload & {
  contact: {
    companyName: string;
    name: string;
    phone: string;
    email: string;
  };
};

export type CreateLeadWithExistingContactPayload = CreateLeadBasePayload & {
  contactId: number;
};

export type CreateLeadPayload =
  | CreateLeadWithNewContactPayload
  | CreateLeadWithExistingContactPayload;

export type UpdateLeadPayload = {
  name?: string;
  location?: string;
  status?: LeadStatus | null;
  contactId?: number;
  projectTypeId?: number;
  startDate?: string;
  leadNumber?: string | null;
  notes?: string[];
};

export function mapLeadFromApi(dto: ApiLeadDTO): Lead {
  return mapLeadFromDTO(dto);
}

export function mapLeadsFromApi(dtos: ApiLeadDTO[]): Lead[] {
  return mapLeadsFromDTO(dtos);
}

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
    notesJson: "[]",
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

export function mapLeadPatchToUpdatePayload(
  patch: LeadPatch
): UpdateLeadPayload {
  return {
    name: patch.name,
    location: patch.location,
    status: patch.status ?? null,
    contactId: patch.contactId,
    projectTypeId: patch.projectTypeId,
    startDate: patch.startDate,
    leadNumber: patch.leadNumber ?? null,
    notes: patch.notes,
  };
}
