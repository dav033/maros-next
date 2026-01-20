
import { SearchConfig } from "@/types/components";
import type { Contact } from "@/contact/domain";


export const customerContactsSearchPlaceholder = "Search contacts…";

export const customerContactsSearchConfig: SearchConfig<Contact> = {
  fields: [
    { key: "all" as any, label: "All fields" },
    { key: "name", label: "Name" },
    { key: "occupation", label: "Occupation" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
  ],
  defaultField: "all" as any,
  normalize: (s: string) => s.toLowerCase().trim(),
};
