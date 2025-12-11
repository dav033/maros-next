import type { Lead, LeadPatch } from "../models";
import type { ISODate } from "@/shared/domain";
import { normalizeEmptyToUndefined } from "@/shared/mappers";
import { createPatch } from "@dav033/dav-components";

export function diffToPatch(current: Lead, updated: Lead): LeadPatch {
  
  const flattenedUpdated = {
    name: updated.name,
    location: updated.location ?? "",
    addressLink: updated.addressLink ?? null,
    status: updated.status,
    startDate: updated.startDate,
    projectTypeId: updated.projectType.id,
    contactId: updated.contact.id,
    leadNumber: updated.leadNumber ?? "",
    notes: updated.notes,
  };
  
  
  const flattenedCurrent = {
    name: current.name,
    location: current.location ?? "",
    addressLink: current.addressLink ?? null,
    status: current.status,
    startDate: current.startDate,
    projectTypeId: current.projectType.id,
    contactId: current.contact.id,
    leadNumber: current.leadNumber ?? "",
    notes: current.notes,
  };

  
  const patch = createPatch(flattenedCurrent, flattenedUpdated, {
    location: normalizeEmptyToUndefined,
    leadNumber: (v: string) => {
      const normalized = normalizeEmptyToUndefined(v);
      return normalized ?? null;
    },
  });

  
  if (JSON.stringify(updated.notes) !== JSON.stringify(current.notes)) {
    patch.notes = updated.notes;
  } else {
    delete patch.notes;
  }

  return patch as LeadPatch;
}
