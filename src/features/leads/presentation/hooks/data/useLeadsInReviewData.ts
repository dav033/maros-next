"use client";

import type { Lead } from "@/leads/domain";
import { useInstantLeadsInReview } from "./useInstantLeadsInReview";
import { useInstantContacts } from "@/contact/presentation";
import { useProjectTypes } from "@/projectType/presentation";

export interface UseLeadsInReviewDataReturn {
  leads: Lead[];
  contacts: ReturnType<typeof useInstantContacts>["contacts"];
  projectTypes: ReturnType<typeof useProjectTypes>["projectTypes"];
  showSkeleton: boolean;
  refetch: () => Promise<void>;
}

export function useLeadsInReviewData(): UseLeadsInReviewDataReturn {
  const { leads, showSkeleton, refetch } = useInstantLeadsInReview();
  const { contacts } = useInstantContacts();
  const { projectTypes } = useProjectTypes();

  return {
    leads: leads ?? [],
    contacts,
    projectTypes,
    showSkeleton: !!showSkeleton,
    refetch,
  };
}
