export type QboAttachmentEntityType =
  | "Customer"
  | "Invoice"
  | "Estimate"
  | "Payment"
  | "Purchase"
  | "Bill"
  | "BillPayment"
  | "VendorCredit"
  | "PurchaseOrder"
  | "JournalEntry";

export interface QboAttachment {
  attachmentId: string;
  fileName: string;
  contentType: string;
  size: number | null;
  note: string;
  createdAt: string;
  updatedAt: string;
  linkedEntityType: QboAttachmentEntityType | string;
  linkedEntityId: string;
  /** Monto de la transacción vinculada en QuickBooks (Bill/Invoice/etc.). */
  linkedEntityAmount: number | null;
  includeOnSend: boolean;
  hasDownloadUrl: boolean;
  downloadUrlExpires: string | null;
  downloadUrlFetchedAt?: string;
  tempDownloadUrl?: string;
}

export interface QboAttachmentByEntity {
  entityType: QboAttachmentEntityType | string;
  entityId: string;
  name?: string;
  attachments: QboAttachment[];
  fallbackUsed: boolean;
}

export interface QboAttachmentWarning {
  code: string;
  message: string;
}

export interface QboProjectAttachmentRef {
  found: boolean;
  projectNumber?: string;
  qboCustomerId?: string;
  displayName?: string;
}

export interface QboProjectAttachments {
  project: QboProjectAttachmentRef;
  attachments: QboAttachment[];
  byEntity: QboAttachmentByEntity[];
  warnings: QboAttachmentWarning[];
  coverage: {
    entitiesChecked: number;
    attachmentsFound: number;
    fallbackUsed: boolean;
  };
}

export interface QboAttachmentDownloadUrl {
  attachmentId: string;
  tempDownloadUrl: string;
  downloadUrlFetchedAt: string;
  downloadUrlExpires: string | null;
  warnings: QboAttachmentWarning[];
}
