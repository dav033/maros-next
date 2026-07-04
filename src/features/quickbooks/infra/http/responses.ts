export interface QboAttachmentResponse {
  attachmentId: string;
  fileName: string;
  contentType: string;
  size: number | null;
  note: string;
  createdAt: string;
  updatedAt: string;
  linkedEntityType: string;
  linkedEntityId: string;
  linkedEntityAmount?: number | null;
  includeOnSend: boolean;
  hasDownloadUrl: boolean;
  downloadUrlExpires: string | null;
  downloadUrlFetchedAt?: string;
  tempDownloadUrl?: string;
}

export interface QboAttachmentByEntityResponse {
  entityRef: {
    entityType: string;
    entityId: string;
    name?: string;
  };
  attachments: QboAttachmentResponse[];
  warnings: QboAttachmentWarningResponse[];
  fallbackUsed: boolean;
}

export interface QboAttachmentWarningResponse {
  code: string;
  message: string;
}

export interface QboProjectAttachmentRefResponse {
  found: boolean;
  projectNumber?: string;
  qboCustomerId?: string;
  displayName?: string;
  refs: Array<{ value: string; name?: string }>;
}

export interface QboProjectAttachmentsResponse {
  project: QboProjectAttachmentRefResponse;
  entityRefs: Array<{ entityType: string; entityId: string; name?: string }>;
  attachments: QboAttachmentResponse[];
  byEntity: QboAttachmentByEntityResponse[];
  warnings: QboAttachmentWarningResponse[];
  coverage: {
    entitiesChecked: number;
    attachmentsFound: number;
    fallbackUsed: boolean;
  };
}

export interface QboAttachmentDownloadUrlResponse {
  attachmentId: string;
  tempDownloadUrl: string;
  downloadUrlFetchedAt: string;
  downloadUrlExpires: string | null;
  warnings: QboAttachmentWarningResponse[];
}

