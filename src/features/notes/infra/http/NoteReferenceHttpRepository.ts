import type { HttpClientLike } from "@/shared/infra";
import { optimizedApiClient } from "@/shared/infra";
import type {
  NoteBacklink,
  NoteReference,
  NoteReferenceKind,
  NoteReferenceOrigin,
  NoteReferenceRepositoryPort,
  NoteReferenceTarget,
} from "@/notes/domain";

import { endpoints as noteEndpoints } from "./endpoints";

/**
 * The API shapes. Deliberately identical to the domain types — the backend already
 * resolves live labels and the `exists` flag, so there is nothing left to map and a
 * pass-through mapper would only be a place for the two to drift apart.
 */
type ApiNoteReferenceDTO = NoteReference;
type ApiNoteReferenceTargetDTO = NoteReferenceTarget;
type ApiNoteBacklinkDTO = NoteBacklink;

export class NoteReferenceHttpRepository implements NoteReferenceRepositoryPort {
  constructor(private readonly api: HttpClientLike = optimizedApiClient) {}

  async listForPage(id: number): Promise<NoteReference[]> {
    const { data } = await this.api.get<ApiNoteReferenceDTO[]>(
      noteEndpoints.pageReferences(id)
    );
    return Array.isArray(data) ? data : [];
  }

  async listBacklinks(id: number): Promise<NoteBacklink[]> {
    const { data } = await this.api.get<ApiNoteBacklinkDTO[]>(
      noteEndpoints.pageBacklinks(id)
    );
    return Array.isArray(data) ? data : [];
  }

  async listNotesReferencing(
    kind: NoteReferenceKind,
    targetId: number,
    origins: NoteReferenceOrigin[] = []
  ): Promise<NoteBacklink[]> {
    const { data } = await this.api.get<ApiNoteBacklinkDTO[]>(
      noteEndpoints.referencesByTarget(),
      {
        params: {
          kind,
          targetId,
          // Omitted rather than sent empty: the backend reads an absent `origins` as
          // "both", and an empty string would validate as a single blank origin.
          ...(origins.length > 0 ? { origins: origins.join(",") } : {}),
        },
      }
    );
    return Array.isArray(data) ? data : [];
  }

  async searchTargets(
    query: string,
    kinds: NoteReferenceKind[] = [],
    perKind = 5
  ): Promise<NoteReferenceTarget[]> {
    const { data } = await this.api.get<ApiNoteReferenceTargetDTO[]>(
      noteEndpoints.referenceTargets(),
      {
        params: {
          q: query,
          perKind,
          ...(kinds.length > 0 ? { kinds: kinds.join(",") } : {}),
        },
      }
    );
    return Array.isArray(data) ? data : [];
  }

  async addRelation(
    id: number,
    kind: NoteReferenceKind,
    targetId: number
  ): Promise<NoteReference[]> {
    const { data } = await this.api.post<ApiNoteReferenceDTO[]>(
      noteEndpoints.pageRelations(id),
      { kind, targetId }
    );
    return Array.isArray(data) ? data : [];
  }

  async removeRelation(
    id: number,
    kind: NoteReferenceKind,
    targetId: number
  ): Promise<void> {
    await this.api.delete<void>(noteEndpoints.pageRelation(id, kind, targetId));
  }
}
