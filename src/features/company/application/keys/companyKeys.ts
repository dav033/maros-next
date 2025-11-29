export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  detail: (id: number) => [...companyKeys.all, "detail", id] as const,
} as const;

export const companyServiceKeys = {
  all: ["company-services"] as const,
  lists: () => [...companyServiceKeys.all, "list"] as const,
  detail: (id: number) => [...companyServiceKeys.all, "detail", id] as const,
} as const;
