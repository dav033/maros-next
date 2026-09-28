import type {
  QboAttachment,
  QboAttachmentDownloadUrl,
  QboProjectAttachments,
  QboProjectLinkRemoval,
  QuickbooksConnection,
} from "./models";

export interface QuickbooksRepositoryPort {
  getProjectAttachments(params: {
    projectNumber: string;
    realmId?: string;
    includeTempDownloadUrl?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<QboProjectAttachments>;

  getAttachmentDownloadUrl(params: {
    attachmentId: string;
    realmId?: string;
  }): Promise<QboAttachmentDownloadUrl>;

  getConnectionStatus(): Promise<QuickbooksConnection>;

  /** Rompe el vínculo del proyecto con QuickBooks. No borra el proyecto ni el lead. */
  unlinkProject(projectId: number): Promise<QboProjectLinkRemoval>;
}

export type QboAttachmentFetcher = (
  params: Parameters<QuickbooksRepositoryPort["getProjectAttachments"]>[0],
) => Promise<QboProjectAttachments>;

export type QboAttachmentEntityKey = QboAttachment["linkedEntityType"];
