"use client";

import { LeadsPageByType } from "@/features/leads/presentation/pages/LeadsPageByType";
import { LeadType } from "@/leads";

export default function PlumbingLeadsPage() {
  return <LeadsPageByType leadType={LeadType.PLUMBING} />;
}
