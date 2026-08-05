"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNotesApp } from "@/di";
import { notesKeys, searchNotePages } from "@/notes/application";

const DEBOUNCE_MS = 250;

export function useNoteSearch(rawQuery: string) {
  const ctx = useNotesApp();
  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(rawQuery), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [rawQuery]);

  const query = useQuery({
    queryKey: notesKeys.search(debouncedQuery),
    queryFn: () => searchNotePages(ctx, debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 30_000,
  });

  return { hits: query.data ?? [], isLoading: query.isFetching };
}
