"use client";

import { useQuery } from "@tanstack/react-query";
import { useNotesApp } from "@/di";
import { notesKeys, getNotePage } from "@/notes/application";
import type { NotePage } from "@/notes/domain";
import { STALE_TIMES } from "@/shared/lib/queryClient";

export function useInstantNotePage(id: number | null, initialData?: NotePage | null) {
  const ctx = useNotesApp();
  const query = useQuery<NotePage | null, Error>({
    queryKey: id != null ? notesKeys.detail(id) : notesKeys.detail("none"),
    queryFn: () => (id != null ? getNotePage(ctx, id) : Promise.resolve(null)),
    initialData: initialData ?? undefined,
    enabled: id != null,
    staleTime: STALE_TIMES.detail,
    gcTime: 10 * 60 * 1000,
  });

  return {
    page: query.data ?? null,
    isLoading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}
