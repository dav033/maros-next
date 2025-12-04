import { BusinessRuleError } from "@/shared/domain";
import { normalizeEmail, normalizePhone, normalizeText } from "@/shared/validation";
import type { ContactDraft } from "../models";

type ContactInput = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  occupation?: unknown;
  address?: unknown;
};

export function buildContactDraft(input: unknown): ContactDraft {
  const src = input as ContactInput;

  const name = normalizeText(src.name);
  if (!name) {
    throw new BusinessRuleError(
      "VALIDATION_ERROR",
      "Contact name must not be empty",
      { details: { field: "name" } }
    );
  }

  const phone = normalizePhone(String(src.phone ?? ""));
  const email = normalizeEmail(String(src.email ?? ""));

  const occupation = normalizeText(src.occupation) || undefined;
  const address = normalizeText(src.address) || undefined;

  return {
    name,
    phone,
    email,
    occupation,
    address,
  };
}
