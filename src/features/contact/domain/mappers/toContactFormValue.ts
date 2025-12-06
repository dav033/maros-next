import type { Contact } from "../models";
import type { ContactFormValue } from "./toContactPatch";

export function toContactFormValue(contact: Contact): ContactFormValue {
  return {
    name: contact.name,
    phone: contact.phone ?? "",
    email: contact.email ?? "",
    occupation: contact.occupation ?? "",
    role: contact.role,
    addressLink: contact.addressLink ?? "",
    address: contact.address ?? "",
    isCustomer: contact.isCustomer,
    isClient: contact.isClient,
    companyId: contact.companyId ?? null,
  };
}
