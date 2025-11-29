import { CompanyId, Company, CompanyDraft, CompanyPatch } from "../../domain";

export interface CompanyRepositoryPort {
  getById(id: CompanyId): Promise<Company | null>;
  findById(id: CompanyId): Promise<Company | null>;
  list(): Promise<Company[]>;
  create(draft: CompanyDraft): Promise<Company>;
  update(id: CompanyId, patch: CompanyPatch): Promise<Company>;
  delete(id: CompanyId): Promise<void>;
}
