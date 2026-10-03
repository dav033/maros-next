/**
 * Contrato de la pantalla de importación de jobs de QuickBooks
 * (GET /projects/quickbooks-import/jobs y POST .../import-batch).
 *
 * El backend diagnostica la lista entera de una pasada, porque una colisión sólo
 * se ve comparando jobs entre sí: dos jobs de QuickBooks pueden derivar el mismo
 * número de proyecto cuando uno es el contrato base y el otro su orden de cambio.
 */

/**
 * Estado con el que llega cada job. Los valores son los del backend (en
 * castellano ya en el contrato HTTP); las frases que se pintan salen de
 * `presentation`, no de `statusDetail`, que viene en inglés.
 */
export type QuickbooksImportJobStatus =
  | "ok"
  | "sin_numero"
  | "ya_importado"
  | "numero_en_uso"
  | "colision";

/** Papel del job dentro de su grupo de colisión. */
export type QuickbooksImportJobRole =
  | "contrato_base"
  | "orden_de_cambio"
  | "indeterminado";

/** Lead o proyecto del CRM cuyo número coincide con el que deriva el job. */
export type QuickbooksImportMatch = {
  leadId: number;
  leadNumber: string | null;
  name: string | null;
  projectId: number | null;
  /** Job de QuickBooks que ya se quedó con ese registro, si hay alguno. */
  qboCustomerId: string | null;
};

/** Otro job que reclama el mismo número de proyecto que éste. */
export type QuickbooksImportJobCollision = {
  qboCustomerId: string;
  displayName: string;
  role: QuickbooksImportJobRole;
  changeOrderNumber: number | null;
  importedProjectId: number | null;
};

export type QuickbooksImportJob = {
  qboCustomerId: string;
  displayName: string;
  fullyQualifiedName: string;
  active: boolean;
  balance: number;
  parentName: string | null;
  /** Número derivado del nombre del job, o `null` si no se pudo derivar. */
  projectNumber: string | null;
  importedProjectId: number | null;
  matchingLeads: QuickbooksImportMatch[];
  status: QuickbooksImportJobStatus;
  /** Frase del backend, en inglés. Sólo como respaldo. */
  statusDetail: string;
  role: QuickbooksImportJobRole;
  changeOrderNumber: number | null;
  /** Número que separaría esta orden de cambio de su contrato base. */
  suggestedProjectNumber: string | null;
  /** Siempre presente, aunque el estado no sea `colision`. */
  collidesWith: QuickbooksImportJobCollision[];
  /** Proyecto que ya reclama este número a través de otro job. */
  conflictProjectId: number | null;
};

/** Una decisión del lote. `leadId` y `projectId` se excluyen mutuamente. */
export type QuickbooksImportDecision = {
  qboCustomerId: string;
  projectNumber: string;
  name?: string;
  location?: string;
  leadId?: number;
  projectId?: number;
};

export type QuickbooksImportOutcome =
  | "created"
  | "linked"
  | "already_imported"
  | "rejected";

/** Resultado de una decisión. Llega en el mismo orden que se mandaron. */
export type QuickbooksImportDecisionResult = {
  qboCustomerId: string;
  projectNumber: string;
  outcome: QuickbooksImportOutcome;
  projectId: number | null;
  leadId: number | null;
  /** Motivo del rechazo, en inglés, tal cual lo devuelve el backend. */
  reason: string | null;
  httpStatus: number | null;
};

/**
 * Respuesta del lote. Un lote entero rechazado sigue siendo 2xx: los fallos por
 * decisión viajan aquí dentro, no como error HTTP.
 */
export type QuickbooksImportBatchReport = {
  total: number;
  created: number;
  linked: number;
  alreadyImported: number;
  rejected: number;
  results: QuickbooksImportDecisionResult[];
};

/**
 * Resultado de POST /projects/quickbooks-import/deactivate-job.
 *
 * La API de QuickBooks no tiene borrado para un Customer: lo unico que existe es
 * `Active: false` (el «Make inactive» de su interfaz), y las transacciones y el
 * historico del job se conservan. De ahi que esto no se llame eliminar en ningun
 * sitio.
 */
export type QuickbooksJobDeactivation = {
  qboCustomerId: string;
  displayName: string;
  /** Estado en que quedó el Customer en QuickBooks. */
  active: boolean;
  deactivated: boolean;
  /** QuickBooks ya lo tenía inactivo: no se escribió nada. */
  alreadyInactive: boolean;
};

/**
 * Tope real del servidor (`MAX_BATCH_DECISIONS` en
 * `quickbooks-project-import.service.ts`): un lote más grande se rechaza entero
 * con 400, así que la UI trocea la selección antes de mandarla.
 */
export const QUICKBOOKS_IMPORT_BATCH_LIMIT = 200;

/** Longitud máxima que acepta `normalizeDecision` en el backend. */
export const QUICKBOOKS_IMPORT_PROJECT_NUMBER_MAX_LENGTH = 50;
