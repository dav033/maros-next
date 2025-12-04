import type { Lead } from "@/leads/domain";
import type { SearchConfig } from "@/shared/search";

export const leadsSearchPlaceholder = "Search leads…";

export const leadsSearchConfig: SearchConfig<Lead> = {
  fields: [
    { key: "name", label: "Name" },
    { key: "leadNumber", label: "Lead Number" },
    { key: "location", label: "Location" },
  ],
  defaultField: "name",
  normalize: (s: string) => s.toLowerCase().trim(),
};
