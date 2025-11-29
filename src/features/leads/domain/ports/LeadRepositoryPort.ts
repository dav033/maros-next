import type { Lead, LeadDraft, LeadPatch, LeadType } from "@/leads";
import type { ResourceRepository } from "@/shared";

export type LeadId = number;

export interface LeadRepositoryPort
  extends ResourceRepository<LeadId, Lead, LeadDraft, LeadPatch> {
  findByType(type: LeadType): Promise<Lead[]>;
  saveNew(draft: LeadDraft): Promise<Lead>;
}
