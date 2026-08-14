"use client";

import { useQuery } from "@tanstack/react-query";
import { useProjectTypesApp } from "@/di";
import { listProjectTypes } from "@/projectType/application";
import type { ProjectType } from "@/projectType/domain";

const DEFAULT_STALE_TIME = 10 * 60 * 1000;

export function useProjectTypes(initialData?: ProjectType[]) {
  const ctx = useProjectTypesApp();

  const { data: projectTypes = [], isLoading, error } = useQuery<ProjectType[], Error>({
    queryKey: ["projectTypes"],
    queryFn: () => listProjectTypes(ctx),
    initialData,
    // Same guard useInstantList already applies to every other list in the app, and
    // the reason project types were the one select that never recovered: an empty
    // SSR response is a transient failure the page loader turned into [] via
    // `.catch(() => [])`, not a real answer. Without this, React Query counts it as
    // fresh as of now and the stale time below pins the empty list for ten minutes,
    // leaving "Project type" with nothing to pick. Backdating it to 0 marks it stale
    // immediately so the browser refetches with its session cookie.
    initialDataUpdatedAt:
      initialData === undefined ? undefined : initialData.length > 0 ? undefined : 0,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: 15 * 60 * 1000,
  });

  return {
    projectTypes,
    isLoading,
    error,
  };
}
