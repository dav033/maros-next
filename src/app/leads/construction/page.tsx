"use client";

import { LeadsPageByType } from "@/features/leads/presentation/pages/LeadsPageByType";
import { LeadType } from "@/leads/domain";

export default function ConstructionLeadsPage() {
  return <LeadsPageByType leadType={LeadType.CONSTRUCTION} />;
}
