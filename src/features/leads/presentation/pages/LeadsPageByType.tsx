"use client";

import type { LeadType } from "@/leads/domain";
import { useLeadsPageLogic } from "./useLeadsPageLogic";
import { LeadsPageView } from "./LeadsPageView";

export type LeadsPageByTypeProps = {
  leadType: LeadType;
};


export function LeadsPageByType({ leadType }: LeadsPageByTypeProps) {
  const logic = useLeadsPageLogic({ leadType });

  return <LeadsPageView logic={logic} />;
}
