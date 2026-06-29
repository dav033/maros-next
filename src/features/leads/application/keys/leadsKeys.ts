import { createEntityKeys } from "@/shared/query";

import type { LeadType } from "@/leads/domain";

const base = createEntityKeys("leads");

export const leadsKeys = {
  ...base,
  byType: (type: LeadType) => [...base.all, "byType", type] as const,
  inReview: () => [...base.all, "inReview"] as const,
  lost: () => [...base.all, "lost"] as const,
  summary: () => [...base.all, "summary"] as const,
} as const;
