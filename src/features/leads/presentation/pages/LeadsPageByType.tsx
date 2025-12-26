"use client";

import type { LeadType } from "@/leads/domain";
import { useLeadsPageLogic } from "./useLeadsPageLogic";
import { LeadsPageView } from "./LeadsPageView";
import type { LeadsPageData } from "../data/loadLeadsData";

export type LeadsPageByTypeProps = {
  leadType: LeadType;
  initialData?: LeadsPageData;
};

export function LeadsPageByType({ leadType, initialData }: LeadsPageByTypeProps) {
  const logic = useLeadsPageLogic({ leadType, initialData });

  return <LeadsPageView logic={logic} />;
}
