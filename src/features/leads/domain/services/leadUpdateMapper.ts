import type { LeadPatch } from "@/leads";

export type UpdateLeadPayload = {
  name?: string;
  location?: string;
  status?: string | null;
  contactId?: number;
  projectTypeId?: number;
  startDate?: string;
  leadNumber?: string | null;
};

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
  };
}
