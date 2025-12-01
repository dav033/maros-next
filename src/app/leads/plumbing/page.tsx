"use client";

import { LeadsPageByType } from "@/features/leads/presentation/components/LeadsPageByType";
import { LeadType } from "@/leads";

export default function PlumbingLeadsPage() {
  return <LeadsPageByType leadType={LeadType.PLUMBING} />;
}
