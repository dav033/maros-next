import { createEntityKeys } from "@/shared/query";
import type { NoteEntityKind } from "@/notes/domain";

const base = createEntityKeys("notes");

export const notesKeys = {
  ...base,
  tree: () => [...base.all, "tree"] as const,
  trash: () => [...base.all, "trash"] as const,
  favorites: () => [...base.all, "favorites"] as const,
  byEntity: (kind: NoteEntityKind, entityId: number) =>
    [...base.all, "byEntity", kind, entityId] as const,
  search: (query: string) => [...base.all, "search", query] as const,
  tags: () => [...base.all, "tags"] as const,
} as const;
