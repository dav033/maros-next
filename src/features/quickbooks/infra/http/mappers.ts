import type {
  QboAttachment,
  QboAttachmentByEntity,
  QboAttachmentDownloadUrl,
  QboAttachmentWarning,
  QboProjectAttachmentRef,
  QboProjectAttachments,
} from "../../domain/models";
import type {
  QboAttachmentByEntityResponse,
  QboAttachmentDownloadUrlResponse,
  QboAttachmentResponse,
  QboAttachmentWarningResponse,
  QboProjectAttachmentRefResponse,
  QboProjectAttachmentsResponse,
} from "./responses";

function mapWarning(w: QboAttachmentWarningResponse): QboAttachmentWarning {
  return { code: w.code, message: w.message };
}

function mapAttachment(a: QboAttachmentResponse): QboAttachment {
  return {
    attachmentId: a.attachmentId,
    fileName: a.fileName,
    contentType: a.contentType,
    size: a.size,
    note: a.note,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    linkedEntityType: a.linkedEntityType,
    linkedEntityId: a.linkedEntityId,
    includeOnSend: a.includeOnSend,
    hasDownloadUrl: a.hasDownloadUrl,
    downloadUrlExpires: a.downloadUrlExpires,
    downloadUrlFetchedAt: a.downloadUrlFetchedAt,
    tempDownloadUrl: a.tempDownloadUrl,
  };
}

function mapByEntity(b: QboAttachmentByEntityResponse): QboAttachmentByEntity {
  return {
    entityType: b.entityRef.entityType,
    entityId: b.entityRef.entityId,
    name: b.entityRef.name,
    attachments: b.attachments.map(mapAttachment),
    fallbackUsed: b.fallbackUsed,
  };
}

function mapProjectRef(p: QboProjectAttachmentRefResponse): QboProjectAttachmentRef {
  const ref: QboProjectAttachmentRef = { found: p.found };
  if (p.projectNumber) ref.projectNumber = p.projectNumber;
  if (p.qboCustomerId) ref.qboCustomerId = p.qboCustomerId;
  if (p.displayName) ref.displayName = p.displayName;
  return ref;
}

export function mapProjectAttachments(
  data: QboProjectAttachmentsResponse,
): QboProjectAttachments {
  return {
    project: mapProjectRef(data.project),
    attachments: data.attachments.map(mapAttachment),
    byEntity: data.byEntity.map(mapByEntity),
    warnings: data.warnings.map(mapWarning),
    coverage: data.coverage,
  };
}

export function mapAttachmentDownloadUrl(
  data: QboAttachmentDownloadUrlResponse,
): QboAttachmentDownloadUrl {
  return {
    attachmentId: data.attachmentId,
    tempDownloadUrl: data.tempDownloadUrl,
    downloadUrlFetchedAt: data.downloadUrlFetchedAt,
    downloadUrlExpires: data.downloadUrlExpires,
    warnings: data.warnings.map(mapWarning),
  };
}
