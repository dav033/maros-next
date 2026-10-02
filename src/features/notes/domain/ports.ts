import type {
  NoteAccessPanel,
  NoteBacklink,
  NoteEntityKind,
  NoteEntityLink,
  NoteLinkDraft,
  NoteLinkPatch,
  NoteLinkStats,
  NoteMoveResult,
  NotePage,
  NotePageDraft,
  NotePageId,
  NotePagePatch,
  NotePageSummary,
  NoteReference,
  NoteReferenceKind,
  NoteReferenceOrigin,
  NoteReferenceTarget,
  NoteSearchHit,
  NoteShareAccess,
  NoteShareLink,
  NoteShareSubjectType,
  NoteTag,
  NoteVisibility,
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
  setEntityLink(id: NotePageId, link: NoteEntityLink): Promise<NotePageSummary>;
  trash(id: NotePageId): Promise<void>;
  restore(id: NotePageId): Promise<NotePage>;
  purge(id: NotePageId): Promise<void>;
}

export interface NoteSharingRepositoryPort {
  /** Notes reachable only through a grant — nothing already visible to the whole team. */
  listSharedWithMe(): Promise<NotePageSummary[]>;
  getAccessPanel(id: NotePageId): Promise<NoteAccessPanel>;
  setVisibility(id: NotePageId, visibility: NoteVisibility): Promise<NotePage>;

  addShare(
    id: NotePageId,
    grant: {
      subjectType: NoteShareSubjectType;
      subjectId: number;
      access: NoteShareAccess;
      expiresAt?: string;
    }
  ): Promise<NoteAccessPanel>;
  updateShare(
    id: NotePageId,
    shareId: number,
    patch: { access?: NoteShareAccess; expiresAt?: string | null }
  ): Promise<NoteAccessPanel>;
  removeShare(id: NotePageId, shareId: number): Promise<void>;

  /** The returned link is the only time its URL is ever available. */
  createLink(id: NotePageId, draft: NoteLinkDraft): Promise<NoteShareLink>;
  updateLink(id: NotePageId, linkId: number, patch: NoteLinkPatch): Promise<NoteShareLink>;
  rotateLink(id: NotePageId, linkId: number): Promise<NoteShareLink>;
  revokeLink(id: NotePageId, linkId: number): Promise<void>;
  getLinkStats(id: NotePageId, linkId: number): Promise<NoteLinkStats>;
  listAllLinks(): Promise<import("./models").NoteAdminLink[]>;
  adminRevokeLink(linkId: number): Promise<void>;
}

export interface NoteTagRepositoryPort {
  list(): Promise<NoteTag[]>;
  create(name: string, color?: string): Promise<NoteTag>;
  update(id: number, patch: { name?: string; color?: string }): Promise<NoteTag>;
  delete(id: number): Promise<void>;
}

/**
 * A note's edges in both directions.
 *
 * Separate from NotePageRepositoryPort because half of it is not about a note: a lead
 * page asks `listNotesReferencing` without having a note in hand, and the editor's
 * mention menu asks `searchTargets` before any reference exists. That split is why the
 * backend gives it its own base path too.
 */
export interface NoteReferenceRepositoryPort {
  /** Everything this note points at — pinned relations first, then body mentions. */
  listForPage(id: NotePageId): Promise<NoteReference[]>;
  /** Notes that point at this note. */
  listBacklinks(id: NotePageId): Promise<NoteBacklink[]>;
  /** Notes that point at a CRM record. `origins` empty means both. */
  listNotesReferencing(
    kind: NoteReferenceKind,
    targetId: number,
    origins?: NoteReferenceOrigin[]
  ): Promise<NoteBacklink[]>;
  /** Records matching `query`, capped per kind. Empty `kinds` means every kind. */
  searchTargets(
    query: string,
    kinds?: NoteReferenceKind[],
    perKind?: number
  ): Promise<NoteReferenceTarget[]>;
  addRelation(
    id: NotePageId,
    kind: NoteReferenceKind,
    targetId: number
  ): Promise<NoteReference[]>;
  removeRelation(id: NotePageId, kind: NoteReferenceKind, targetId: number): Promise<void>;
}
