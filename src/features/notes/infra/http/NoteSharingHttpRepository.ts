import type { HttpClientLike } from "@/shared/infra";
import { optimizedApiClient } from "@/shared/infra";
import type {
  NoteAccessPanel,
  NoteAdminLink,
  NoteLinkDraft,
  NoteLinkPatch,
  NoteLinkStats,
  NotePage,
  NotePageId,
  NotePageSummary,
  NoteShareAccess,
  NoteShareLink,
  NoteShareSubjectType,
  NoteSharingRepositoryPort,
  NoteVisibility,
} from "@/notes/domain";

import { endpoints as noteEndpoints } from "./endpoints";
import {
  type ApiNoteAccessPanelDTO,
  type ApiNotePageDTO,
  type ApiNotePageSummaryDTO,
  type ApiNoteShareLinkDTO,
  mapNoteAccessPanelFromApi,
  mapNoteLinkStatsFromApi,
  mapNotePageFromApi,
  mapNotePageSummariesFromApi,
  mapNoteShareLinkFromApi,
} from "./mappers";

export class NoteSharingHttpRepository implements NoteSharingRepositoryPort {
  constructor(private readonly api: HttpClientLike = optimizedApiClient) {}

  async listSharedWithMe(): Promise<NotePageSummary[]> {
    const { data } = await this.api.get<ApiNotePageSummaryDTO[]>(
      noteEndpoints.sharedWithMe()
    );
    return mapNotePageSummariesFromApi(Array.isArray(data) ? data : []);
  }

  async getAccessPanel(id: NotePageId): Promise<NoteAccessPanel> {
    const { data } = await this.api.get<ApiNoteAccessPanelDTO>(noteEndpoints.access(id));
    return mapNoteAccessPanelFromApi(data);
  }

  async setVisibility(id: NotePageId, visibility: NoteVisibility): Promise<NotePage> {
    const { data } = await this.api.patch<ApiNotePageDTO>(noteEndpoints.visibility(id), {
      visibility,
    });
    return mapNotePageFromApi(data);
  }

  async addShare(
    id: NotePageId,
    grant: {
      subjectType: NoteShareSubjectType;
      subjectId: number;
      access: NoteShareAccess;
      expiresAt?: string;
    }
  ): Promise<NoteAccessPanel> {
    const { data } = await this.api.post<ApiNoteAccessPanelDTO>(
      noteEndpoints.shares(id),
      grant
    );
    return mapNoteAccessPanelFromApi(data);
  }

  async updateShare(
    id: NotePageId,
    shareId: number,
    patch: { access?: NoteShareAccess; expiresAt?: string | null }
  ): Promise<NoteAccessPanel> {
    const { data } = await this.api.patch<ApiNoteAccessPanelDTO>(
      noteEndpoints.share(id, shareId),
      patch
    );
    return mapNoteAccessPanelFromApi(data);
  }

  async removeShare(id: NotePageId, shareId: number): Promise<void> {
    await this.api.delete<void>(noteEndpoints.share(id, shareId));
  }

  /**
   * The response to this call is the only place the link's URL ever exists — the server
   * keeps a SHA-256 of the token and nothing else. Losing it means rotating, not
   * looking it up.
   */
  async createLink(id: NotePageId, draft: NoteLinkDraft): Promise<NoteShareLink> {
    const { data } = await this.api.post<ApiNoteShareLinkDTO>(
      noteEndpoints.links(id),
      draft
    );
    return mapNoteShareLinkFromApi(data);
  }

  async updateLink(
    id: NotePageId,
    linkId: number,
    patch: NoteLinkPatch
  ): Promise<NoteShareLink> {
    const { data } = await this.api.patch<ApiNoteShareLinkDTO>(
      noteEndpoints.link(id, linkId),
      patch
    );
    return mapNoteShareLinkFromApi(data);
  }

  async rotateLink(id: NotePageId, linkId: number): Promise<NoteShareLink> {
    const { data } = await this.api.post<ApiNoteShareLinkDTO>(
      noteEndpoints.rotateLink(id, linkId)
    );
    return mapNoteShareLinkFromApi(data);
  }

  async revokeLink(id: NotePageId, linkId: number): Promise<void> {
    await this.api.delete<void>(noteEndpoints.link(id, linkId));
  }

  async getLinkStats(id: NotePageId, linkId: number): Promise<NoteLinkStats> {
    const { data } = await this.api.get<NoteLinkStats>(
      noteEndpoints.linkViews(id, linkId)
    );
    return mapNoteLinkStatsFromApi(data);
  }

  async listAllLinks(): Promise<NoteAdminLink[]> {
    const { data } = await this.api.get<NoteAdminLink[]>(noteEndpoints.allLinks());
    return Array.isArray(data) ? data : [];
  }

  async adminRevokeLink(linkId: number): Promise<void> {
    await this.api.delete<void>(`${noteEndpoints.allLinks()}/${linkId}`);
  }
}
