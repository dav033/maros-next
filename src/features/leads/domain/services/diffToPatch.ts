import type { Lead, LeadPatch } from "../models";
import type { ISODate } from "@/shared";

export function diffToPatch(current: Lead, updated: Lead): LeadPatch {
  return {
    ...(updated.name !== current.name ? { name: updated.name } : {}),
    ...((updated.location ?? "") !== (current.location ?? "")
      ? { location: updated.location ?? "" }
      : {}),
    ...(updated.status !== current.status ? { status: updated.status } : {}),
    ...(updated.startDate !== current.startDate
      ? { startDate: updated.startDate as ISODate }
      : {}),
    ...(updated.projectType.id !== current.projectType.id
      ? { projectTypeId: updated.projectType.id }
      : {}),
    ...(updated.contact.id !== current.contact.id
      ? { contactId: updated.contact.id }
      : {}),
    ...((updated.leadNumber ?? "") !== (current.leadNumber ?? "")
      ? { leadNumber: updated.leadNumber ?? null }
      : {}),
    ...(updated.notesJson !== current.notesJson
      ? {
          notes: updated.notesJson ? JSON.parse(updated.notesJson) : [],
        }
      : {}),
  };
}
