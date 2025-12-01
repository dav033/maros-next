import type { ContactDraft } from "../models";
import type { ContactFormValue } from "../../presentation/components/ContactForm";
import { normalizeEmptyToUndefined } from "@/shared/mappers/dto";

export function toContactDraft(value: ContactFormValue): ContactDraft {
  return {
    name: value.name.trim(),
    phone: normalizeEmptyToUndefined(value.phone),
    email: normalizeEmptyToUndefined(value.email),
    occupation: normalizeEmptyToUndefined(value.occupation),
    address: normalizeEmptyToUndefined(value.address),
    isCustomer: value.isCustomer,
    isClient: value.isClient,
    companyId: value.companyId,
  };
}
