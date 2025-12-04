import type { Lead, LeadDraft, LeadPatch, LeadType } from "@/features/leads/domain";

export type LeadId = number;

/**
 * Domain port for Lead repository.
 * Defines the contract for persisting and retrieving leads.
 * Infra implementations should implement this interface.
 */
export interface LeadRepositoryPort {
  getById(id: LeadId): Promise<Lead | null>;
  list(): Promise<Lead[]>;
  create(draft: LeadDraft): Promise<Lead>;
  update(id: LeadId, patch: LeadPatch): Promise<Lead>;
  delete(id: LeadId): Promise<void>;
  findByType(type: LeadType): Promise<Lead[]>;
  saveNew(draft: LeadDraft): Promise<Lead>;
}
