import { createEntityKeys } from "@/shared/query";
import type {
  NoteEntityKind,
  NoteReferenceKind,
  NoteReferenceOrigin,
} from "@/notes/domain";

const base = createEntityKeys("notes");

export const notesKeys = {
  ...base,
  tree: () => [...base.all, "tree"] as const,
  trash: () => [...base.all, "trash"] as const,
  favorites: () => [...base.all, "favorites"] as const,
  /** Prefix of every byEntity list, for invalidating both sides of a reassignment. */
  byEntityAll: () => [...base.all, "byEntity"] as const,
  byEntity: (kind: NoteEntityKind, entityId: number) =>
    [...base.all, "byEntity", kind, entityId] as const,
  search: (query: string) => [...base.all, "search", query] as const,
  tags: () => [...base.all, "tags"] as const,
  sharedWithMe: () => [...base.all, "shared-with-me"] as const,
  access: (id: number) => [...base.all, "access", id] as const,
  linkViews: (id: number, linkId: number) =>
    [...base.all, "access", id, "links", linkId, "views"] as const,

  /**
   * Prefix of everything reference-shaped. Saving a note rewrites its inline references,
   * which changes backlinks on the other side too — invalidating this one prefix is how
   * both ends refresh without each caller having to know who points at whom.
   */
  referencesAll: () => [...base.all, "references"] as const,
  references: (id: number) => [...base.all, "references", "page", id] as const,
  backlinks: (id: number) => [...base.all, "references", "backlinks", id] as const,
  referencingTarget: (
    kind: NoteReferenceKind,
    targetId: number,
    origins: NoteReferenceOrigin[] = []
  ) =>
    [...base.all, "references", "target", kind, targetId, origins.join(",")] as const,
  referenceTargets: (query: string, kinds: NoteReferenceKind[] = []) =>
    [...base.all, "references", "search", kinds.join(","), query] as const,
} as const;
