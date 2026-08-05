import type {
  NoteEntityKind,
  NoteMoveResult,
  NotePage,
  NotePageDraft,
  NotePageId,
  NotePagePatch,
  NotePageSummary,
  NoteSearchHit,
  NoteTag,
} from "./models";

export interface NotePageRepositoryPort {
  list(): Promise<NotePageSummary[]>;
  listTrash(): Promise<NotePageSummary[]>;
  listFavorites(): Promise<NotePageSummary[]>;
  listByEntity(kind: NoteEntityKind, entityId: number): Promise<NotePageSummary[]>;
  search(query: string, limit?: number): Promise<NoteSearchHit[]>;
  getById(id: NotePageId): Promise<NotePage | null>;
  create(draft: NotePageDraft): Promise<NotePage>;
  update(id: NotePageId, patch: NotePagePatch): Promise<NotePage>;
  updateContent(
    id: NotePageId,
    content: Record<string, unknown>,
    expectedUpdatedAt?: string
  ): Promise<NotePage>;
  move(
    id: NotePageId,
    parentId: number | null,
    beforeId?: number | null,
    afterId?: number | null
  ): Promise<NoteMoveResult>;
  setFavorite(id: NotePageId, isFavorite: boolean): Promise<NotePageSummary>;
  setTags(id: NotePageId, tagIds: number[]): Promise<NotePageSummary>;
  trash(id: NotePageId): Promise<void>;
  restore(id: NotePageId): Promise<NotePage>;
  purge(id: NotePageId): Promise<void>;
}

export interface NoteTagRepositoryPort {
  list(): Promise<NoteTag[]>;
  create(name: string, color?: string): Promise<NoteTag>;
  update(id: number, patch: { name?: string; color?: string }): Promise<NoteTag>;
  delete(id: number): Promise<void>;
}
