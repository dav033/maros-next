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

/** Resultado de PUT /projects/:id/qbo-link: enlazar la ficha con un job. */
export interface QboProjectLinkAssignment {
  projectId: number;
  leadId: number | null;
  projectNumber: string | null;
  qboCustomerId: string;
  jobDisplayName: string;
  /** Job que tenía antes, cuando el enlace se reemplazó. */
  previousQboCustomerId: string | null;
  /** false cuando ya estaba enlazado a ese mismo job: la llamada no cambió nada. */
  linked: boolean;
  alreadyLinked: boolean;
  /** El nombre del job lleva el número de proyecto. Informativo: no bloquea. */
  projectNumberMatchesJob: boolean;
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
