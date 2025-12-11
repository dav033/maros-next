export const contactsKeys = {
  all: ["contacts"] as const,
  list: ["contacts", "list"] as const,
  byCompany: (companyId: number | string) => ["contacts", "company", companyId] as const,
} as const;
