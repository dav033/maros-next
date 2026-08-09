import type {
  NoteAccessLevel,
  NoteAccessPanel,
  NoteAuthor,
  NoteEntityKind,
  NoteKind,
  NoteLinkStats,
  NoteMoveResult,
  NotePage,
  NotePageDraft,
  NotePagePatch,
  NotePageSummary,
  NoteSearchHit,
  NoteShare,
  NoteShareAccess,
  NoteShareLink,
  NoteShareSubjectType,
  NoteTag,
  NoteVisibility,
} from "@/notes/domain";

export type ApiNoteTagDTO = { id: number; name: string; color: string };

export type ApiNoteAuthorDTO = {
  id: number;
  name: string | null;
  email: string;
  picture: string | null;
};

export type ApiNotePageSummaryDTO = {
  id: number;
  parentId: number | null;
  kind?: NoteKind;
  title: string;
  icon: string | null;
  position: number;
  isFavorite: boolean;
  entityKind: NoteEntityKind | null;
  entityId: number | null;
  visibility?: NoteVisibility;
  isShared?: boolean;
  isPublished?: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId?: number | null;
  lastEditedBy?: ApiNoteAuthorDTO | null;
  tags: ApiNoteTagDTO[];
};

export type ApiNotePageDTO = ApiNotePageSummaryDTO & {
  content: Record<string, unknown>;
  myAccess?: NoteAccessLevel;
};

export type ApiNoteSearchHitDTO = {
  id: number;
  title: string;
  icon: string | null;
  parentId: number | null;
  updatedAt: string;
  rank: number;
};

export type CreateNotePagePayload = {
  title?: string;
  icon?: string;
  kind?: NoteKind;
  parentId?: number | null;
  entityKind?: NoteEntityKind;
  entityId?: number;
};

export type UpdateNotePagePayload = {
  title?: string;
  icon?: string;
};

export function mapNoteTagFromApi(dto: ApiNoteTagDTO): NoteTag {
  return { id: dto.id, name: dto.name, color: dto.color };
}

export function mapNoteAuthorFromApi(dto: ApiNoteAuthorDTO): NoteAuthor {
  return { id: dto.id, name: dto.name, email: dto.email, picture: dto.picture };
}

export function mapNotePageSummaryFromApi(dto: ApiNotePageSummaryDTO): NotePageSummary {
  return {
    id: dto.id,
    parentId: dto.parentId,
    // Defaulted rather than required: a cached response written before folders
    // existed has no `kind`, and every one of those rows is a page.
    kind: dto.kind ?? "page",
    title: dto.title,
    icon: dto.icon,
    position: dto.position,
    isFavorite: dto.isFavorite,
    // All three default the same way and for the same reason as `kind`: a response
    // cached before sharing existed carries none of them, and "team, unshared,
    // unpublished" is exactly what those rows were.
    visibility: dto.visibility ?? "team",
    isShared: dto.isShared ?? false,
    isPublished: dto.isPublished ?? false,
    ownerId: dto.ownerId ?? null,
    entityKind: dto.entityKind,
    entityId: dto.entityId,
    deletedAt: dto.deletedAt,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    lastEditedBy: dto.lastEditedBy ? mapNoteAuthorFromApi(dto.lastEditedBy) : null,
    tags: (dto.tags ?? []).map(mapNoteTagFromApi),
  };
}

export function mapNotePageSummariesFromApi(dtos: ApiNotePageSummaryDTO[]): NotePageSummary[] {
  return dtos.map(mapNotePageSummaryFromApi);
}

export function mapNotePageFromApi(dto: ApiNotePageDTO): NotePage {
  return {
    ...mapNotePageSummaryFromApi(dto),
    content: dto.content ?? {},
    // Endpoints that return a summary shape (favorite, tags, entity link) carry no
    // access level. Defaulting to `owner` is safe because the server already refused
    // the call if the caller lacked the rights — this value only drives what the UI
    // offers, never what it is allowed to do.
    myAccess: dto.myAccess ?? "owner",
  };
}

export function mapNoteSearchHitFromApi(dto: ApiNoteSearchHitDTO): NoteSearchHit {
  return {
    id: dto.id,
    title: dto.title,
    icon: dto.icon,
    parentId: dto.parentId,
    updatedAt: dto.updatedAt,
    rank: dto.rank,
  };
}

export function mapNotePageDraftToCreatePayload(draft: NotePageDraft): CreateNotePagePayload {
  return {
    title: draft.title,
    icon: draft.icon,
    kind: draft.kind,
    parentId: draft.parentId,
    entityKind: draft.entityKind,
    entityId: draft.entityId,
  };
}

export function mapNotePagePatchToUpdatePayload(patch: NotePagePatch): UpdateNotePagePayload {
  return { title: patch.title, icon: patch.icon };
}

export function mapNoteMoveResultFromApi(dto: NoteMoveResult): NoteMoveResult {
  return dto;
}

// ---------------------------------------------------------------------------
// Sharing
// ---------------------------------------------------------------------------

export type ApiNoteShareDTO = {
  id: number;
  subjectType: NoteShareSubjectType;
  subjectId: number;
  access: NoteShareAccess;
  expiresAt: string | null;
  createdAt: string;
  inheritedFrom: string | null;
  subject: { name: string | null; email: string | null; picture: string | null };
};

export type ApiNoteShareLinkDTO = {
  id: number;
  tokenHint: string;
  hasPassword: boolean;
  includeChildren: boolean;
  allowIndexing: boolean;
  showAuthor: boolean;
  expiresAt: string | null;
  revokedAt: string | null;
  isActive: boolean;
  viewCount: number;
  lastViewedAt: string | null;
  createdAt: string;
  createdById: number | null;
  /** Only ever present on create and rotate. */
  url?: string;
};

export type ApiNoteAccessPanelDTO = {
  pageId: number;
  myAccess: NoteAccessLevel;
  visibility: NoteVisibility;
  ownerId: number | null;
  shares: ApiNoteShareDTO[];
  links: ApiNoteShareLinkDTO[];
};

export function mapNoteShareFromApi(dto: ApiNoteShareDTO): NoteShare {
  return {
    id: dto.id,
    subjectType: dto.subjectType,
    subjectId: dto.subjectId,
    access: dto.access,
    expiresAt: dto.expiresAt,
    createdAt: dto.createdAt,
    inheritedFrom: dto.inheritedFrom,
    subject: {
      name: dto.subject?.name ?? null,
      email: dto.subject?.email ?? null,
      picture: dto.subject?.picture ?? null,
    },
  };
}

export function mapNoteShareLinkFromApi(dto: ApiNoteShareLinkDTO): NoteShareLink {
  return {
    id: dto.id,
    tokenHint: dto.tokenHint,
    hasPassword: dto.hasPassword,
    includeChildren: dto.includeChildren,
    allowIndexing: dto.allowIndexing,
    showAuthor: dto.showAuthor,
    expiresAt: dto.expiresAt,
    revokedAt: dto.revokedAt,
    isActive: dto.isActive,
    viewCount: dto.viewCount,
    lastViewedAt: dto.lastViewedAt,
    createdAt: dto.createdAt,
    createdById: dto.createdById,
    url: dto.url,
  };
}

export function mapNoteAccessPanelFromApi(dto: ApiNoteAccessPanelDTO): NoteAccessPanel {
  return {
    pageId: dto.pageId,
    myAccess: dto.myAccess,
    visibility: dto.visibility,
    ownerId: dto.ownerId,
    shares: (dto.shares ?? []).map(mapNoteShareFromApi),
    links: (dto.links ?? []).map(mapNoteShareLinkFromApi),
  };
}

export function mapNoteLinkStatsFromApi(dto: NoteLinkStats): NoteLinkStats {
  return {
    linkId: dto.linkId,
    totalViews: dto.totalViews,
    uniqueVisitors: dto.uniqueVisitors,
    lastViewedAt: dto.lastViewedAt,
    byDay: dto.byDay ?? [],
    recent: dto.recent ?? [],
  };
}
