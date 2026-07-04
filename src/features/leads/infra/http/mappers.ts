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
  leadType?: string | null; // Opcional, se calcula desde leadNumber
  contactId?: number;
  projectTypeId?: number;
  notes?: string[];
  attachments?: string[];
  conversion?: {
    converted?: boolean | null;
    projectId?: number | string | null;
  } | null;
  inReview?: boolean;
  financial?: {
    estimatedAmount?: number | null;
  } | null;
};
import type { LeadStatus } from "@/leads/domain";
import { mapLeadFromDTO, mapLeadsFromDTO } from "@/leads/domain";

export type CreateLeadBasePayload = {
  leadNumber: string | null;
  name?: string;
  startDate: ISODate;
  location: string;
  addressLink?: string | null;
  status: LeadStatus | null;
  projectTypeId?: number;
  inReview?: boolean;
};

export type CreateLeadWithNewContactPayload = CreateLeadBasePayload & {
  contact: {
    name: string;
    phone: string;
    email: string;
    companyId?: number;
    address?: string;
    addressLink?: string;
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
  attachments?: string[];
  inReview?: boolean;
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
    inReview: draft.inReview,
  };

  if (draft.name && draft.name.trim() !== '') {
    base.name = draft.name;
  }

  if ("contact" in draft) {
    const contactPayload: CreateLeadWithNewContactPayload["contact"] = {
      name: draft.contact.name,
      phone: draft.contact.phone,
      email: draft.contact.email,
    };

    if (
      typeof draft.contact.companyId === "number" &&
      Number.isInteger(draft.contact.companyId) &&
      draft.contact.companyId > 0
    ) {
      contactPayload.companyId = draft.contact.companyId;
    }

    return {
      ...base,
      contact: contactPayload,
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
    attachments: patch.attachments,
    inReview: patch.inReview,
  };
}
