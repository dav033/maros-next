import type {
  QboAttachment,
  QboAttachmentDownloadUrl,
  QboProjectAttachments,
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
}

export type QboAttachmentFetcher = (
  params: Parameters<QuickbooksRepositoryPort["getProjectAttachments"]>[0],
) => Promise<QboProjectAttachments>;

export type QboAttachmentEntityKey = QboAttachment["linkedEntityType"];
