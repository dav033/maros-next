"use client";

import { useMemo, useState, useCallback } from "react";
import type { QboProjectAttachments } from "../../domain/models";
import { useGroupedQboAttachments } from "./useGroupedQboAttachments";

export interface QboAttachmentsFilter {
  query: string;
  types: ReadonlySet<string>;
}

export interface QboFilteredAttachments {
  filtered: ReturnType<typeof useGroupedQboAttachments>;
  filter: QboAttachmentsFilter;
  setQuery: (value: string) => void;
  toggleType: (entityType: string) => void;
  clearFilters: () => void;
  hasActiveFilter: boolean;
  totalBeforeFilter: number;
}

const EMPTY_TYPES: ReadonlySet<string> = new Set();

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function attachmentMatches(
  fileName: string,
  note: string,
  linkedEntityId: string,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) return true;
  if (normalize(fileName).includes(normalizedQuery)) return true;
  if (normalize(note).includes(normalizedQuery)) return true;
  if (linkedEntityId && linkedEntityId.includes(normalizedQuery)) return true;
  return false;
}

export function useFilteredQboAttachments(
  data: QboProjectAttachments | undefined,
): QboFilteredAttachments {
  const grouped = useGroupedQboAttachments(data);
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<ReadonlySet<string>>(EMPTY_TYPES);

  const toggleType = useCallback((entityType: string) => {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(entityType)) {
        next.delete(entityType);
      } else {
        next.add(entityType);
      }
      return next.size === 0 ? EMPTY_TYPES : next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setQuery("");
    setTypes(EMPTY_TYPES);
  }, []);

  const filtered = useMemo(() => {
    const normalized = normalize(query);
    if (!normalized && types.size === 0) {
      return grouped;
    }
    const sections = grouped.sections
      .filter((section) => types.size === 0 || types.has(section.entityType))
      .map((section) => {
        if (!normalized) return section;
        const matched = section.attachments.filter((a) =>
          attachmentMatches(
            a.fileName,
            a.note,
            a.linkedEntityId,
            normalized,
          ),
        );
        return { ...section, attachments: matched };
      })
      .filter((section) => section.attachments.length > 0);
    const total = sections.reduce((acc, s) => acc + s.attachments.length, 0);
    return { sections, total, isEmpty: total === 0 };
  }, [grouped, query, types]);

  const hasActiveFilter = query.trim().length > 0 || types.size > 0;

  return {
    filtered,
    filter: { query, types },
    setQuery,
    toggleType,
    clearFilters,
    hasActiveFilter,
    totalBeforeFilter: grouped.total,
  };
}
