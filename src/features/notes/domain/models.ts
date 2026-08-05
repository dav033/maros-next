export type NoteEntityKind = "lead" | "project" | "contact" | "company";

export interface NoteTag {
  id: number;
  name: string;
  color: string;
}

export interface NotePageSummary {
  id: number;
  parentId: number | null;
  title: string;
  icon: string | null;
  position: number;
  isFavorite: boolean;
  entityKind: NoteEntityKind | null;
  entityId: number | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: NoteTag[];
}

export interface NotePage extends NotePageSummary {
  content: Record<string, unknown>;
}

export type NotePageId = number;

export type NotePageDraft = Readonly<{
  title?: string;
  icon?: string;
  parentId?: number | null;
  entityKind?: NoteEntityKind;
  entityId?: number;
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
