import type { Lead, LeadDraft, LeadId, LeadPatch, LeadType } from "./models";
import type { ResourceRepository } from "@/shared";

export interface LeadRepositoryPort
  extends ResourceRepository<LeadId, Lead, LeadDraft, LeadPatch> {
  findByType(type: LeadType): Promise<Lead[]>;
  saveNew(draft: LeadDraft): Promise<Lead>;
}

export interface LeadNumberAvailabilityPort {
  isAvailable(leadNumber: string): Promise<boolean>;
}
