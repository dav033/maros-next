import type {
  Company,
  CompanyDraft,
  CompanyId,
  CompanyPatch,
  CompanyService,
  CompanyServiceDraft,
  CompanyServicePatch,
  CompanyServiceId,
} from "./models";


export interface CompanyRepositoryPort {
  getById(id: CompanyId): Promise<Company | null>;
  list(): Promise<Company[]>;
  create(draft: CompanyDraft): Promise<Company>;
  update(id: CompanyId, patch: CompanyPatch): Promise<Company>;
  delete(id: CompanyId): Promise<void>;
  assignContacts(companyId: number, contactIds: number[]): Promise<void>;
}


export interface CompanyServiceRepositoryPort {
  getById(id: CompanyServiceId): Promise<CompanyService | null>;
  list(): Promise<CompanyService[]>;
  create(draft: CompanyServiceDraft): Promise<CompanyService>;
  update(id: CompanyServiceId, patch: CompanyServicePatch): Promise<CompanyService>;
  delete(id: CompanyServiceId): Promise<void>;
}
