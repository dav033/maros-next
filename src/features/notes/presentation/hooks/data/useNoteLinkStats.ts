"use client";

import { useQuery } from "@tanstack/react-query";
import { useNotesApp } from "@/di";
import { notesKeys, listNoteLinkViews } from "@/notes/application";
import type { NoteLinkStats } from "@/notes/domain";

export function useNoteLinkStats(
  pageId: number | null,
  linkId: number | null,
  enabled: boolean
) {
  const ctx = useNotesApp();

  const query = useQuery<NoteLinkStats>({
    queryKey: notesKeys.linkViews(pageId ?? 0, linkId ?? 0),
    queryFn: () => listNoteLinkViews(ctx, pageId as number, linkId as number),
    enabled: enabled && pageId != null && linkId != null,
  });

  return { stats: query.data ?? null, isLoading: query.isPending };
}
