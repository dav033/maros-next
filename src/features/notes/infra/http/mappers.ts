import type {
  NoteEntityKind,
  NoteMoveResult,
  NotePage,
  NotePageDraft,
  NotePagePatch,
  NotePageSummary,
  NoteSearchHit,
  NoteTag,
} from "@/notes/domain";

export type ApiNoteTagDTO = { id: number; name: string; color: string };

export type ApiNotePageSummaryDTO = {
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

export function mapNotePageSummaryFromApi(dto: ApiNotePageSummaryDTO): NotePageSummary {
  return {
    id: dto.id,
    parentId: dto.parentId,
    title: dto.title,
    icon: dto.icon,
    position: dto.position,
    isFavorite: dto.isFavorite,
    entityKind: dto.entityKind,
    entityId: dto.entityId,
    deletedAt: dto.deletedAt,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
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
