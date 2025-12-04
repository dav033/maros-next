import type { Contact, ContactUniquenessCheck, DuplicateCheckOptions } from "../models";
import {
  normalizeEmail,
  normalizeLower,
  normalizePhone,
  normalizeText,
} from "@/shared/validation";

export function normalizeName(name?: string): string {
  return normalizeLower(name);
}

function normalizeEmailForIdentity(email?: string): string {
  const normalized = normalizeEmail(email);
  return normalized ? normalizeLower(normalized) : "";
}

function normalizePhoneForIdentity(phone?: string): string {
  const normalized = normalizePhone(phone);
  return normalized ? normalizeText(normalized) : "";
}

export function makeContactIdentityKey(
  contactOrCandidate: Contact | ContactUniquenessCheck,
  opts: DuplicateCheckOptions = {}
): string {
  const options = {
    useName: opts.useName ?? true,
    useEmail: opts.useEmail ?? true,
    usePhone: opts.usePhone ?? true,
  };

  const parts: string[] = [];

  if (options.useName) {
    parts.push(normalizeName(contactOrCandidate.name));
  } else {
    parts.push("");
  }

  if (options.useEmail) {
    parts.push(normalizeEmailForIdentity(contactOrCandidate.email));
  } else {
    parts.push("");
  }

  if (options.usePhone) {
    parts.push(normalizePhoneForIdentity(contactOrCandidate.phone));
  } else {
    parts.push("");
  }

  return parts.join("|");
}

export function areContactsPotentialDuplicates(
  a: Contact,
  b: Contact,
  opts?: DuplicateCheckOptions
): boolean {
  const keyA = makeContactIdentityKey(a, opts);
  const keyB = makeContactIdentityKey(b, opts);
  return keyA === keyB;
}
