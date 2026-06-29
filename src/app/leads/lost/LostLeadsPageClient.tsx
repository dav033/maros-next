"use client";

import { LostLeadsPageView } from "@/features/leads/presentation/pages/LostLeadsPageView";
import { useLostLeadsPageLogic } from "@/features/leads/presentation/pages/useLostLeadsPageLogic";

export function LostLeadsPageClient() {
  const logic = useLostLeadsPageLogic();

  return <LostLeadsPageView logic={logic} />;
}
