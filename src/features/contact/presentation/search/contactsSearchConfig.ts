import type { Contact } from "@/contact/domain";
import type { SearchConfig } from "@dav033/dav-components";

export const contactsSearchPlaceholder = "Search contacts…";

export const contactsSearchConfig: SearchConfig<Contact> = {
  fields: [
    { key: "name", label: "Name" },
    { key: "occupation", label: "Occupation" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
  ],
  defaultField: "name",
  normalize: (s: string) => s.toLowerCase().trim(),
};
