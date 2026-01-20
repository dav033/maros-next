"use client";

import { LeadsInReviewPageView } from "@/features/leads/presentation/pages/LeadsInReviewPageView";
import { useLeadsInReviewPageLogic } from "@/features/leads/presentation/pages/useLeadsInReviewPageLogic";

export function LeadsInReviewPageClient() {
  const logic = useLeadsInReviewPageLogic();

  return <LeadsInReviewPageView logic={logic} />;
}
