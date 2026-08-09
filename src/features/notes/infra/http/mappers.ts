import type {
  NoteAuthor,
  NoteEntityKind,
  NoteKind,
  NoteMoveResult,
  NotePage,
  NotePageDraft,
  NotePagePatch,
  NotePageSummary,
  NoteSearchHit,
  NoteTag,
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
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastEditedBy?: ApiNoteAuthorDTO | null;
  tags: ApiNoteTagDTO[];
};

export type ApiNotePageDTO = ApiNotePageSummaryDTO & {
  content: Record<string, unknown>;
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
