"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNotesApp } from "@/di";
import { notesKeys } from "@/notes/application";
import type { NoteReferenceKind, NoteReferenceTarget } from "@/notes/domain";

const DEBOUNCE_MS = 200;

/**
 * Server-side search over referenceable records, for the relations picker.
 *
 * Deliberately not the client-side filter the old NoteEntityPicker used: that one pulled
 * every lead, project, contact and company into the browser to filter four lists locally,
 * and this picker covers seven kinds including tasks. One debounced request per keystroke
 * pause is both less data and the only version that stays usable as the CRM grows.
 */
export function useReferenceTargetSearch(
  rawQuery: string,
  kinds: NoteReferenceKind[],
  enabled: boolean
) {
  const ctx = useNotesApp();
  const [debounced, setDebounced] = useState(rawQuery);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(rawQuery), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [rawQuery]);

  const query = useQuery<NoteReferenceTarget[]>({
    queryKey: notesKeys.referenceTargets(debounced, kinds),
    queryFn: () => ctx.repos.noteReference.searchTargets(debounced, kinds, 6),
    enabled,
    staleTime: 60_000,
  });

  return {
    targets: query.data ?? [],
    // isFetching, not isLoading: a cached page of results followed by a new query should
    // still say it is working, or the list looks stale rather than busy.
    isLoading: query.isFetching,
    error: query.error,
  };
}
