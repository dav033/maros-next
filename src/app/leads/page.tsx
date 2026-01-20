"use client";

import { SelectOption } from "@/types/components";
import { Suspense } from "react";
import { LeadsPageByType } from "@/features/leads/presentation/pages/LeadsPageByType";
import { useLeadTypeStorage } from "@/features/leads/presentation/hooks/useLeadTypeStorage";

import { LeadType } from "@/leads/domain";

import { LeadsPageClient } from "./LeadsPageClient";

const LEAD_TYPE_OPTIONS: SelectOption[] = [
  { value: LeadType.CONSTRUCTION, label: "Construction" },
  { value: LeadType.ROOFING, label: "Roofing" },
  { value: LeadType.PLUMBING, label: "Plumbing" },
];

export default function LeadsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LeadsPageClient />
    </Suspense>
  );
}

