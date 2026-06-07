import { createEntityKeys, type EntityId } from "@/shared/query";

const base = createEntityKeys("contacts");

export const contactsKeys = {
  ...base,
  list: ["contacts", "list"] as const,
  byCompany: (companyId: EntityId) =>
    [...base.all, "company", companyId] as const,
} as const;
