import type { Contact, ContactDraft, ContactId, ContactPatch, ContactUniquenessCheck } from "./models";
import type { ResourceRepository } from "@/shared";

export interface ContactRepositoryPort
  extends ResourceRepository<ContactId, Contact, ContactDraft, ContactPatch> {
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
