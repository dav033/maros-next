import type { Lead, LeadDraft, LeadId, LeadPatch, LeadType } from "./models";


export interface LeadRepositoryPort {
  getById(id: LeadId): Promise<Lead | null>;
  getByLeadNumber(leadNumber: string): Promise<Lead | null>;
  list(): Promise<Lead[]>;
  create(draft: LeadDraft, leadTypeForGeneration?: LeadType): Promise<Lead>;
  update(id: LeadId, patch: LeadPatch): Promise<Lead>;
  delete(id: LeadId): Promise<void>;
  findByType(type: LeadType): Promise<Lead[]>;
  saveNew(draft: LeadDraft, leadTypeForGeneration?: LeadType): Promise<Lead>;
}

export interface LeadNumberAvailabilityPort {
  isAvailable(leadNumber: string): Promise<boolean>;
}
