import type { Contact, ContactDraft, ContactId, ContactPatch, ContactUniquenessCheck } from "./models";


export interface ContactRepositoryPort {
  getById(id: ContactId): Promise<Contact | null>;
  list(): Promise<Contact[]>;
  listByCompany?(companyId: number): Promise<Contact[]>;
  create(draft: ContactDraft): Promise<Contact>;
  update(id: ContactId, patch: ContactPatch): Promise<Contact>;
  delete(id: ContactId): Promise<void>;
  search?(query: string): Promise<Contact[]>;
}

export interface ContactsServicePort {
  delete(id: number): Promise<boolean>;
}

export interface ContactUniquenessPort {
  isDuplicate(candidate: ContactUniquenessCheck): Promise<{
    duplicate: boolean;
    conflictId?: number;
  }>;
  findDuplicates(candidate: ContactUniquenessCheck): Promise<Contact[]>;
}
