import type {
  QboAttachmentDownloadUrl,
  QboProjectAttachments,
  QboProjectLinkAssignment,
  QboProjectLinkRemoval,
  QuickbooksConnection,
} from "../../domain/models";
import type { QuickbooksRepositoryPort } from "../../domain/ports";
import type { HttpClientLike } from "@/shared/infra/http";
import { optimizedApiClient } from "@/shared/infra/http";
import { quickbooksEndpoints } from "./endpoints";
import {
  mapAttachmentDownloadUrl,
  mapProjectAttachments,
  mapProjectLinkAssignment,
  mapProjectLinkRemoval,
  mapQuickbooksConnection,
} from "./mappers";
import type {
  QboAttachmentDownloadUrlResponse,
  QboProjectAttachmentsResponse,
  QboProjectLinkAssignmentResponse,
  QboProjectLinkRemovalResponse,
  QuickbooksConnectionResponse,
} from "./responses";

export class QuickbooksHttpRepository implements QuickbooksRepositoryPort {
  constructor(private readonly api: HttpClientLike = optimizedApiClient) {}

  async getProjectAttachments(params: {
    projectNumber: string;
    realmId?: string;
    includeTempDownloadUrl?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<QboProjectAttachments> {
    const { data } = await this.api.get<QboProjectAttachmentsResponse>(
      quickbooksEndpoints.projectAttachments(params.projectNumber),
      {
        params: {
          realmId: params.realmId,
          includeTempDownloadUrl: params.includeTempDownloadUrl,
          startDate: params.startDate,
          endDate: params.endDate,
        },
      },
    );
    return mapProjectAttachments(data);
  }

  async getAttachmentDownloadUrl(params: {
    attachmentId: string;
    realmId?: string;
  }): Promise<QboAttachmentDownloadUrl> {
    const { data } = await this.api.get<QboAttachmentDownloadUrlResponse>(
      quickbooksEndpoints.attachmentDownloadUrl(params.attachmentId),
      { params: { realmId: params.realmId } },
    );
    return mapAttachmentDownloadUrl(data);
  }

  async getConnectionStatus(): Promise<QuickbooksConnection> {
    const { data } = await this.api.get<QuickbooksConnectionResponse>(
      quickbooksEndpoints.connectionStatus(),
    );
    return mapQuickbooksConnection(data);
  }

  async linkProject(params: {
    projectId: number;
    qboCustomerId: string;
  }): Promise<QboProjectLinkAssignment> {
    const { data } = await this.api.put<QboProjectLinkAssignmentResponse>(
      quickbooksEndpoints.projectQboLink(params.projectId),
      { qboCustomerId: params.qboCustomerId },
    );
    return mapProjectLinkAssignment(data);
  }

  async unlinkProject(projectId: number): Promise<QboProjectLinkRemoval> {
    const { data } = await this.api.delete<QboProjectLinkRemovalResponse>(
      quickbooksEndpoints.projectQboLink(projectId),
    );
    return mapProjectLinkRemoval(data);
  }
}
