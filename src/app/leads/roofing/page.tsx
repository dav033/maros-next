"use client";

import { LeadsPageByType } from "@/features/leads/presentation/pages/LeadsPageByType";
import { LeadType } from "@/leads";

export default function RoofingLeadsPage() {
  return <LeadsPageByType leadType={LeadType.ROOFING} />;
}
