export type NoteEntityKind = "lead" | "project" | "contact" | "company";

/** A folder groups pages and has no document of its own. */
export type NoteKind = "page" | "folder";

export interface NoteTag {
  id: number;
  name: string;
  color: string;
}

/**
 * Denormalized on the page rather than resolved client-side: listing users needs the
 * `users:read` permission, which members don't have.
 */
export interface NoteAuthor {
  id: number;
  name: string | null;
  email: string;
  picture: string | null;
}

export interface NotePageSummary {
  id: number;
  parentId: number | null;
  kind: NoteKind;
  title: string;
  icon: string | null;
  position: number;
  /** Personal to the signed-in user, not a property of the page itself. */
  isFavorite: boolean;
  entityKind: NoteEntityKind | null;
  entityId: number | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastEditedBy: NoteAuthor | null;
  tags: NoteTag[];
}

export interface NotePage extends NotePageSummary {
  content: Record<string, unknown>;
}

export type NotePageId = number;

export type NotePageDraft = Readonly<{
  title?: string;
  icon?: string;
  kind?: NoteKind;
  parentId?: number | null;
  entityKind?: NoteEntityKind;
  entityId?: number;
}>;

/** Both null clears the link; otherwise they travel together. */
export type NoteEntityLink = Readonly<{
  entityKind: NoteEntityKind | null;
  entityId: number | null;
}>;

export type NotePagePatch = Readonly<{
  title?: string;
  icon?: string;
}>;

export interface NoteTreeNode extends NotePageSummary {
  children: NoteTreeNode[];
}

export interface NoteMoveResult {
  id: number;
  parentId: number | null;
  position: number;
}

export interface NoteSearchHit {
  id: number;
  title: string;
  icon: string | null;
  parentId: number | null;
  updatedAt: string;
  rank: number;
}

export function emptyNoteDoc(): Record<string, unknown> {
  return { type: "doc", content: [] };
}
