export const projectsSearchConfig = {
  fields: [
    { key: "all", label: "All fields" },
    { key: "lead.name", label: "Lead Name" },
    { key: "lead.leadNumber", label: "Lead Number" },
  ],
  defaultField: "all",
  normalize: (text: string) => text.toLowerCase().trim(),
} as const;

export const projectsSearchPlaceholder = "Search projects...";

