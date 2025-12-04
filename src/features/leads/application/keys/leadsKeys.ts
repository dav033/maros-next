import type { LeadType } from "@/leads/domain";

export const leadsKeys = {
  all: ["leads"] as const,
  byType: (type: LeadType) => [...leadsKeys.all, "byType", type] as const,
  detail: (id: number) => [...leadsKeys.all, "detail", id] as const,
  summary: () => [...leadsKeys.all, "summary"] as const,
} as const;
