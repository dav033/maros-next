export const projectsSearchConfig = {
  fields: [
    { key: "all", label: "All fields" },
    { key: "lead.name", label: "Project Name" },
    { key: "lead.leadNumber", label: "Project Number" },
  ],
  defaultField: "all",
  normalize: (text: string) => text.toLowerCase().trim(),
} as const;

export const projectsSearchPlaceholder = "Search projects...";

