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

export interface QboProjectLinkRemoval {
  projectId: number;
  leadId: number | null;
  previousQboCustomerId: string | null;
  /** false cuando el proyecto ya no tenía vínculo: la llamada no cambió nada. */
  unlinked: boolean;
}

export interface QuickbooksConnection {
  /** Hay credenciales guardadas. No garantiza que Intuit las siga aceptando. */
  connected: boolean;
  /** Identificador de la empresa en QuickBooks. null cuando nunca se conectó. */
  realmId: string | null;
  /** false cuando el servidor no tiene configurado OAuth: conectar no es posible. */
  oauthConfigured: boolean;
  accessTokenExpiresAt: string | null;
  accessTokenExpiresInSeconds: number | null;
  accessTokenExpired: boolean;
  /** Los tokens rotan en cada refresco: este es el último refresco correcto. */
  lastRefreshedAt: string | null;
  connectedAt: string | null;
  /** Ruta de reautorización, relativa a la URL base de la API. */
  authorizationUrl: string;
  checkedAt: string;
}
