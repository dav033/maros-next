import type { HttpClientLike } from "@/shared/infra";
import { optimizedApiClient } from "@/shared/infra";
import type { NoteTag } from "@/notes/domain";
import type { NoteTagRepositoryPort } from "@/notes/domain";

import { endpoints as noteEndpoints } from "./endpoints";
import { type ApiNoteTagDTO, mapNoteTagFromApi } from "./mappers";

export class NoteTagHttpRepository implements NoteTagRepositoryPort {
  constructor(private readonly api: HttpClientLike = optimizedApiClient) {}

  async list(): Promise<NoteTag[]> {
    const { data } = await this.api.get<ApiNoteTagDTO[]>(noteEndpoints.tags());
    return Array.isArray(data) ? data.map(mapNoteTagFromApi) : [];
  }

  async create(name: string, color?: string): Promise<NoteTag> {
    const { data } = await this.api.post<ApiNoteTagDTO>(noteEndpoints.tags(), { name, color });
    return mapNoteTagFromApi(data);
  }

  async update(id: number, patch: { name?: string; color?: string }): Promise<NoteTag> {
    const { data } = await this.api.put<ApiNoteTagDTO>(noteEndpoints.tag(id), patch);
    return mapNoteTagFromApi(data);
  }

  async delete(id: number): Promise<void> {
    await this.api.delete<void>(noteEndpoints.tag(id));
  }
}
