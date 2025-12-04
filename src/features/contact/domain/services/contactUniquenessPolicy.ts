import type { Contact, ContactLike, ContactUniquenessCheck, DuplicateCheckOptions, UniquenessOptions } from "../models";
import { BusinessRuleError } from "@/shared/domain";
import { areContactsPotentialDuplicates, makeContactIdentityKey } from "./contactIdentityPolicy";

export function toUniquenessCandidate(c: ContactLike): ContactUniquenessCheck {
  return {
    name: c.name,
    email: c.email,
    phone: c.phone,
  };
}

export function buildIdentityIndex(
  contacts: readonly Contact[],
  opts?: UniquenessOptions
): Map<string, Contact[]> {
  const index = new Map<string, Contact[]>();
  const duplicateOpts: DuplicateCheckOptions = {
    useName: opts?.useName,
    useEmail: opts?.useEmail,
    usePhone: opts?.usePhone,
  };

  for (const contact of contacts) {
    const key = makeContactIdentityKey(contact, duplicateOpts);
    const existing = index.get(key);
    if (existing) {
      existing.push(contact);
    } else {
      index.set(key, [contact]);
    }
  }

  return index;
}

export function findDuplicate(
  contacts: readonly Contact[],
  candidate: ContactLike,
  opts?: UniquenessOptions
): Contact | undefined {
  const duplicateOpts: DuplicateCheckOptions = {
    useName: opts?.useName,
    useEmail: opts?.useEmail,
    usePhone: opts?.usePhone,
  };

  const candidateCheck = toUniquenessCandidate(candidate);
  const candidateKey = makeContactIdentityKey(candidateCheck, duplicateOpts);

  for (const contact of contacts) {
    const contactKey = makeContactIdentityKey(contact, duplicateOpts);
    if (contactKey === candidateKey) {
      return contact;
    }
  }

  return undefined;
}

export function ensureUniqueness(
  contacts: readonly Contact[],
  candidate: ContactLike,
  opts?: UniquenessOptions
): void {
  const duplicate = findDuplicate(contacts, candidate, opts);

  if (duplicate) {
    throw new BusinessRuleError("CONFLICT", "Duplicate contact detected", {
      details: {
        conflictId: duplicate.id,
        conflictName: duplicate.name,
      },
    });
  }
}
