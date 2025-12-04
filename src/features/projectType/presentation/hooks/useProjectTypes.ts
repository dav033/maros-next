"use client";

import { useQuery } from "@tanstack/react-query";
import { useProjectTypesApp } from "@/di";
import { listProjectTypes } from "@/projectType/application";
import type { ProjectType } from "@/projectType/domain";

const DEFAULT_STALE_TIME = 10 * 60 * 1000;

export function useProjectTypes() {
  const ctx = useProjectTypesApp();

  const { data: projectTypes = [], isLoading, error } = useQuery<ProjectType[], Error>({
    queryKey: ["projectTypes"],
    queryFn: () => listProjectTypes(ctx),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: 15 * 60 * 1000,
  });

  return {
    projectTypes,
    isLoading,
    error,
  };
}
