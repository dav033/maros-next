import type { ISODate } from "@/shared/domain";
import type { Lead, LeadDraft, LeadPatch } from "@/leads/domain";
export type ApiLeadDTO = {
  id: number;
  leadNumber: string;
  name: string;
  startDate: string;
  location: string;
  addressLink?: string;
  status: string;
  leadType: string;
  contactId?: number;
  projectTypeId?: number;
  notes?: string[];
};
import type { LeadStatus, LeadType } from "@/leads/domain";
import { mapLeadFromDTO, mapLeadsFromDTO } from "@/leads/domain";

export type CreateLeadBasePayload = {
  leadNumber: string | null;
  name?: string;
  startDate: ISODate;
  location: string;
  addressLink?: string | null;
  status: LeadStatus | null;
  projectTypeId: number;
  leadType: LeadType;
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
  addressLink?: string | null;
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
    startDate: draft.startDate,
    location: draft.location,
    addressLink: draft.addressLink,
    status: draft.status,
    projectTypeId: draft.projectTypeId,
    leadType: draft.leadType,
  };

  if (draft.name && draft.name.trim() !== '') {
    base.name = draft.name;
  }

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
    addressLink: patch.addressLink === undefined ? undefined : patch.addressLink ?? null,
    status: patch.status === undefined ? undefined : patch.status ?? null,
    contactId: patch.contactId,
    projectTypeId: patch.projectTypeId,
    startDate: patch.startDate,
    leadNumber: patch.leadNumber,
    notes: patch.notes,
  };
}
