"use client";

import { useQuery } from "@tanstack/react-query";
import { useNotesApp } from "@/di";
import { notesKeys, getNoteAccess } from "@/notes/application";
import type { NoteAccessPanel } from "@/notes/domain";

/**
 * Only fetched while the share dialog is open (`enabled`): the panel resolves grants up
 * the ancestor chain and lists links, which is real work to do on every note the user
 * merely clicks through.
 */
export function useNoteAccess(pageId: number | null, enabled: boolean) {
  const ctx = useNotesApp();

  const query = useQuery<NoteAccessPanel>({
    queryKey: notesKeys.access(pageId ?? 0),
    queryFn: () => getNoteAccess(ctx, pageId as number),
    enabled: enabled && pageId != null,
    staleTime: 0,
  });

  return { panel: query.data ?? null, isLoading: query.isPending, error: query.error };
}
