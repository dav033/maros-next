"use client";

import type { Lead } from "@/leads/domain";
import { useInstantLeadsInReview } from "./useInstantLeadsInReview";
import { useInstantContacts } from "@/contact/presentation";
import { useProjectTypes } from "@/projectType/presentation";

export interface UseLeadsInReviewDataReturn {
  leads: Lead[];
  contacts: ReturnType<typeof useInstantContacts>["contacts"];
  projectTypes: ReturnType<typeof useProjectTypes>["projectTypes"];
  projectTypesLoading: ReturnType<typeof useProjectTypes>["isLoading"];
  projectTypesFetching: ReturnType<typeof useProjectTypes>["isFetching"];
  projectTypesError: ReturnType<typeof useProjectTypes>["error"];
  refetchProjectTypes: ReturnType<typeof useProjectTypes>["refetch"];
  showSkeleton: boolean;
  refetch: () => Promise<void>;
}

export function useLeadsInReviewData(): UseLeadsInReviewDataReturn {
  const { leads, showSkeleton, refetch } = useInstantLeadsInReview();
  const { contacts } = useInstantContacts();
  const {
    projectTypes,
    isLoading: projectTypesLoading,
    isFetching: projectTypesFetching,
    error: projectTypesError,
    refetch: refetchProjectTypes,
  } = useProjectTypes();

  return {
    leads: leads ?? [],
    contacts,
    projectTypes,
    projectTypesLoading,
    projectTypesFetching,
    projectTypesError,
    refetchProjectTypes,
    showSkeleton: !!showSkeleton,
    refetch,
  };
}
