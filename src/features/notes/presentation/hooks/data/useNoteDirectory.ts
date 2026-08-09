"use client";

import { useQuery } from "@tanstack/react-query";
import { useNotesApp } from "@/di";
import { notesKeys, listNoteDirectory } from "@/notes/application";
import type { NoteDirectoryUser } from "@/notes/domain";

/** Colleagues change rarely; five minutes of cache keeps the picker instant. */
const STALE_TIME_MS = 5 * 60_000;

export function useNoteDirectory(enabled: boolean) {
  const ctx = useNotesApp();

  const query = useQuery<NoteDirectoryUser[]>({
    queryKey: notesKeys.directory(),
    queryFn: () => listNoteDirectory(ctx),
    enabled,
    staleTime: STALE_TIME_MS,
  });

  return { users: query.data ?? [], isLoading: query.isPending };
}
