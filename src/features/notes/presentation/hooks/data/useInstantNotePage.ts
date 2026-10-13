"use client";

import { useNavigationDetailQuery } from "@/shared/query/useNavigationDetailQuery";
import { useQueryClient } from "@tanstack/react-query";
import { findCachedListItem } from "@/shared/query/findCachedListItem";
import { useNotesApp } from "@/di";
import { notesKeys, getNotePage } from "@/notes/application";
import type { NotePage, NotePageSummary } from "@/notes/domain";
import { STALE_TIMES } from "@/shared/lib/queryClient";

export function useInstantNotePage(id: number | null, initialData?: NotePage | null) {
  const ctx = useNotesApp();
  const queryClient = useQueryClient();
  const summary = findCachedListItem<NotePageSummary>(queryClient, notesKeys.all,
    (item) => item.id === id && (item.kind === "page" || item.kind === "folder") && typeof item.title === "string");
  const query = useNavigationDetailQuery<NotePage | null>({
    queryKey: id != null ? notesKeys.detail(id) : notesKeys.detail("none"),
    queryFn: () => (id != null ? getNotePage(ctx, id) : Promise.resolve(null)),
    initialData: initialData ?? undefined,
    enabled: id != null,
    staleTime: STALE_TIMES.detail,
    gcTime: 10 * 60 * 1000,
  });

  return {
    page: query.data ?? null,
    summary,
    isLoading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}
