import type { HttpClientLike, ResourceRepository } from "@/shared/infra";
import { optimizedApiClient, makeHttpResourceRepository } from "@/shared/infra";
import type {
  NoteEntityKind,
  NoteMoveResult,
  NotePage,
  NotePageDraft,
  NotePageId,
  NotePagePatch,
  NotePageSummary,
  NoteSearchHit,
} from "@/notes/domain";
import type { NotePageRepositoryPort } from "@/notes/domain";

import { endpoints as noteEndpoints } from "./endpoints";
import {
  type ApiNotePageDTO,
  type ApiNotePageSummaryDTO,
  type ApiNoteSearchHitDTO,
  mapNoteMoveResultFromApi,
  mapNotePageDraftToCreatePayload,
  mapNotePageFromApi,
  mapNotePagePatchToUpdatePayload,
  mapNotePageSummariesFromApi,
  mapNoteSearchHitFromApi,
} from "./mappers";

export class NotePageHttpRepository implements NotePageRepositoryPort {
  private readonly resource: ResourceRepository<number, NotePage, NotePageDraft, NotePagePatch>;

  constructor(private readonly api: HttpClientLike = optimizedApiClient) {
    this.resource = makeHttpResourceRepository<
      number,
      ApiNotePageDTO,
      NotePage,
      NotePageDraft,
      NotePagePatch
    >({
      endpoints: noteEndpoints,
      mappers: {
        fromApi: mapNotePageFromApi,
        toCreateDto: mapNotePageDraftToCreatePayload,
        toUpdateDto: mapNotePagePatchToUpdatePayload,
      },
      api: this.api,
    });
  }

  getById = (id: NotePageId) => this.resource.getById(id);
  create = (draft: NotePageDraft) => this.resource.create(draft);
  update = (id: NotePageId, patch: NotePagePatch) => this.resource.update(id, patch);

  async list(): Promise<NotePageSummary[]> {
    const { data } = await this.api.get<ApiNotePageSummaryDTO[]>(noteEndpoints.base);
    return mapNotePageSummariesFromApi(Array.isArray(data) ? data : []);
  }

  async listTrash(): Promise<NotePageSummary[]> {
    const { data } = await this.api.get<ApiNotePageSummaryDTO[]>(noteEndpoints.trash());
    return mapNotePageSummariesFromApi(Array.isArray(data) ? data : []);
  }

  async listFavorites(): Promise<NotePageSummary[]> {
    const { data } = await this.api.get<ApiNotePageSummaryDTO[]>(noteEndpoints.favorites());
    return mapNotePageSummariesFromApi(Array.isArray(data) ? data : []);
  }

  async listByEntity(kind: NoteEntityKind, entityId: number): Promise<NotePageSummary[]> {
    const { data } = await this.api.get<ApiNotePageSummaryDTO[]>(noteEndpoints.byEntity(), {
      params: { entityKind: kind, entityId },
    });
    return mapNotePageSummariesFromApi(Array.isArray(data) ? data : []);
  }

  async search(query: string, limit = 20): Promise<NoteSearchHit[]> {
    const { data } = await this.api.get<ApiNoteSearchHitDTO[]>(noteEndpoints.search(), {
      params: { q: query, limit },
    });
    return Array.isArray(data) ? data.map(mapNoteSearchHitFromApi) : [];
  }

  async updateContent(
    id: NotePageId,
    content: Record<string, unknown>,
    expectedUpdatedAt?: string
  ): Promise<NotePage> {
    const { data } = await this.api.patch<ApiNotePageDTO>(noteEndpoints.content(id), {
      content,
      expectedUpdatedAt,
    });
    return mapNotePageFromApi(data);
  }

  async move(
    id: NotePageId,
    parentId: number | null,
    beforeId?: number | null,
    afterId?: number | null
  ): Promise<NoteMoveResult> {
    const { data } = await this.api.patch<NoteMoveResult>(noteEndpoints.move(id), {
      parentId,
      beforeId,
      afterId,
    });
    return mapNoteMoveResultFromApi(data);
  }

  async setFavorite(id: NotePageId, isFavorite: boolean): Promise<NotePageSummary> {
    const { data } = await this.api.patch<ApiNotePageSummaryDTO>(noteEndpoints.favorite(id), {
      isFavorite,
    });
    return mapNotePageFromApi(data as ApiNotePageDTO);
  }

  async setTags(id: NotePageId, tagIds: number[]): Promise<NotePageSummary> {
    const { data } = await this.api.patch<ApiNotePageSummaryDTO>(noteEndpoints.setTags(id), {
      tagIds,
    });
    return mapNotePageFromApi(data as ApiNotePageDTO);
  }

  async trash(id: NotePageId): Promise<void> {
    await this.api.delete<void>(noteEndpoints.remove(id));
  }

  async restore(id: NotePageId): Promise<NotePage> {
    const { data } = await this.api.post<ApiNotePageDTO>(noteEndpoints.restore(id));
    return mapNotePageFromApi(data);
  }

  async purge(id: NotePageId): Promise<void> {
    await this.api.delete<void>(noteEndpoints.purge(id));
  }
}
