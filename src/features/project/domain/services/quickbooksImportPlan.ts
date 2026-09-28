import type {
  QuickbooksImportDecision,
  QuickbooksImportJob,
  QuickbooksImportMatch,
} from "../models/QuickbooksImportJob";
import { QUICKBOOKS_IMPORT_BATCH_LIMIT } from "../models/QuickbooksImportJob";

/**
 * Sufijo de orden de cambio tal como lo compara el backend: `CO1`, `CO 01` y
 * `C01` (con cero en lugar de la letra O, que es lo que hizo colapsar los jobs
 * 283 y 387 en un solo número) son la misma orden de cambio.
 */
const CHANGE_ORDER_SUFFIX = /^(.*?)[\s,|-]*C[O0][\s-]*(\d+)$/i;

/**
 * Clave de comparación de números de proyecto, igual que
 * `normalizeProjectNumber` del backend. Sin colapsar las grafías, `001R-0625 C01`
 * y `001R-0625 CO1` parecerían proyectos distintos.
 */
export function normalizeProjectNumberKey(value: string | null | undefined): string {
  const number = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s*-\s*/g, "-");
  const changeOrder = number.match(CHANGE_ORDER_SUFFIX);
  if (!changeOrder) return number;
  return `${changeOrder[1].trim()} CO${Number(changeOrder[2])}`;
}

/** True cuando el número ya lleva su propio sufijo de orden de cambio. */
export function isChangeOrderNumber(value: string | null | undefined): boolean {
  return CHANGE_ORDER_SUFFIX.test(String(value ?? "").trim());
}

/** Qué haría el backend con la fila: abrir un proyecto nuevo o enganchar uno que ya existe. */
export type QuickbooksImportRowIntent = "crear" | "vincular";

/** Por qué una fila no se puede mandar. */
export type QuickbooksImportBlockedReason =
  | "ya_importado"
  | "numero_en_uso"
  | "sin_numero"
  | "orden_de_cambio_sin_numero";

export type QuickbooksImportRowPlan = {
  qboCustomerId: string;
  job: QuickbooksImportJob;
  /** Número que viajaría en la decisión, ya recortado. */
  projectNumber: string;
  /** Lo que el operador tiene escrito, sin recortar: es lo que pinta el input. */
  rawProjectNumber: string;
  /** El operador cambió el número que derivó el backend. */
  overridden: boolean;
  intent: QuickbooksImportRowIntent;
  /** Registros libres del CRM con este número: más de uno es ambiguo. */
  matchOptions: QuickbooksImportMatch[];
  /** Registro del CRM al que se vincularía, para poder decir a cuál. */
  match: QuickbooksImportMatch | null;
  /** Lead libre al que se vincularía, cuando ese lead todavía no tiene proyecto. */
  leadId: number | null;
  /** Proyecto libre al que se vincularía. */
  projectId: number | null;
  /**
   * Orden de cambio que sigue llevando el número del contrato base: el backend
   * la rechaza al escribir, así que no puede salir «lista».
   */
  changeOrderNeedsOwnNumber: boolean;
  /** `null` cuando la fila se puede seleccionar. */
  blockedReason: QuickbooksImportBlockedReason | null;
  /** Se puede mandar, pero sigue peleando el número con otro job. */
  unresolvedCollision: boolean;
};

/**
 * Traduce un job y el número que el operador haya escrito encima a la decisión
 * que se mandaría, y dice si la fila se puede seleccionar.
 *
 * `override` manda sobre el número que derivó el backend y se guarda tal cual se
 * escribió: recortarlo aquí borra el espacio en cuanto se teclea, y ese espacio
 * es justo el que separa `001R-0625` de su orden de cambio. Sólo la decisión
 * viaja recortada. Cuando el número cambia, las coincidencias del CRM
 * (calculadas para el número original) dejan de valer: el backend exige que el
 * número de la decisión sea el del lead al que se vincula, así que con un número
 * distinto sólo puede crear.
 *
 * `chosenLeadId` es el registro que eligió el operador cuando el número casa con
 * varios; sin elección se toma el primer libre.
 */
export function planImportRow(
  job: QuickbooksImportJob,
  override?: string | null,
  chosenLeadId?: number | null,
): QuickbooksImportRowPlan {
  const rawProjectNumber = override ?? job.projectNumber ?? "";
  const projectNumber = rawProjectNumber.trim();
  const originalKey = normalizeProjectNumberKey(job.projectNumber);
  const key = normalizeProjectNumberKey(projectNumber);
  const sameNumber = key !== "" && key === originalKey;

  const matchOptions = sameNumber
    ? job.matchingLeads.filter(
        (match) => !match.qboCustomerId || match.qboCustomerId === job.qboCustomerId,
      )
    : [];
  const freeMatch =
    (chosenLeadId != null
      ? matchOptions.find((match) => match.leadId === chosenLeadId)
      : undefined) ??
    matchOptions[0] ??
    null;

  const stillCollides = sameNumber && job.collidesWith.length > 0;
  // La misma guarda de escritura que `importJob` en el backend: una orden de
  // cambio que se queda con el número del contrato base sale con
  // ConflictException, así que la fila no puede salir «lista».
  const changeOrderNeedsOwnNumber =
    job.role === "orden_de_cambio" && !isChangeOrderNumber(projectNumber);

  return {
    qboCustomerId: job.qboCustomerId,
    job,
    projectNumber,
    rawProjectNumber,
    overridden: override != null && override.trim() !== (job.projectNumber ?? ""),
    intent: freeMatch ? "vincular" : "crear",
    matchOptions,
    match: freeMatch,
    leadId: freeMatch && freeMatch.projectId == null ? freeMatch.leadId : null,
    projectId: freeMatch?.projectId ?? null,
    changeOrderNeedsOwnNumber,
    blockedReason: blockedReason(job, projectNumber, sameNumber, changeOrderNeedsOwnNumber),
    // El contrato base se queda con el número base legítimamente; el que tiene
    // que separarse es la orden de cambio. Cuando el backend no pudo distinguir
    // (ambos `indeterminado`) nadie puede decidir por el operador.
    unresolvedCollision:
      stillCollides && (job.role === "orden_de_cambio" || job.role === "indeterminado"),
  };
}

function blockedReason(
  job: QuickbooksImportJob,
  projectNumber: string,
  sameNumber: boolean,
  changeOrderNeedsOwnNumber: boolean,
): QuickbooksImportBlockedReason | null {
  if (job.importedProjectId != null) return "ya_importado";
  if (!projectNumber) return "sin_numero";
  if (changeOrderNeedsOwnNumber) return "orden_de_cambio_sin_numero";
  // Con otro número las coincidencias tomadas dejan de estorbar: el backend
  // crearía un lead nuevo en lugar de pelear por el que ya está vinculado.
  if (job.status === "numero_en_uso" && sameNumber) return "numero_en_uso";
  return null;
}

export function planImportRows(
  jobs: readonly QuickbooksImportJob[],
  overrides: Readonly<Record<string, string>>,
  chosenLeadIds: Readonly<Record<string, number>> = {},
): QuickbooksImportRowPlan[] {
  return jobs.map((job) =>
    planImportRow(job, overrides[job.qboCustomerId], chosenLeadIds[job.qboCustomerId]),
  );
}

/** Lo que se le promete al operador antes de que pulse «Importar». */
export type QuickbooksImportPlanSummary = {
  /** Filas seleccionadas que se van a mandar. */
  selected: number;
  toCreate: number;
  toLink: number;
  /** Seleccionadas que siguen peleando el número con otro job. */
  unresolvedCollisions: number;
  /** Seleccionadas que el servidor no aceptaría; nunca viajan en el lote. */
  blocked: number;
  /** Lotes en que se trocea la selección para no pasarse del límite. */
  batches: number;
};

export function summarizeImportPlan(
  plans: readonly QuickbooksImportRowPlan[],
  selectedIds: ReadonlySet<string>,
): QuickbooksImportPlanSummary {
  const chosen = plans.filter((plan) => selectedIds.has(plan.qboCustomerId));
  const sendable = chosen.filter((plan) => plan.blockedReason == null);

  return {
    selected: sendable.length,
    toCreate: sendable.filter((plan) => plan.intent === "crear").length,
    toLink: sendable.filter((plan) => plan.intent === "vincular").length,
    unresolvedCollisions: sendable.filter((plan) => plan.unresolvedCollision).length,
    blocked: chosen.length - sendable.length,
    batches: Math.ceil(sendable.length / QUICKBOOKS_IMPORT_BATCH_LIMIT),
  };
}

/** Decisiones de las filas seleccionadas, en el orden en que se ven en la tabla. */
export function buildImportDecisions(
  plans: readonly QuickbooksImportRowPlan[],
  selectedIds: ReadonlySet<string>,
): QuickbooksImportDecision[] {
  return plans
    .filter((plan) => selectedIds.has(plan.qboCustomerId) && plan.blockedReason == null)
    .map((plan) => ({
      qboCustomerId: plan.qboCustomerId,
      projectNumber: plan.projectNumber,
      ...(plan.projectId != null
        ? { projectId: plan.projectId }
        : plan.leadId != null
          ? { leadId: plan.leadId }
          : {}),
    }));
}

/** Trocea en lotes del tamaño que acepta el servidor. */
export function chunkImportDecisions(
  decisions: readonly QuickbooksImportDecision[],
  limit: number = QUICKBOOKS_IMPORT_BATCH_LIMIT,
): QuickbooksImportDecision[][] {
  const chunks: QuickbooksImportDecision[][] = [];
  for (let index = 0; index < decisions.length; index += limit) {
    chunks.push(decisions.slice(index, index + limit));
  }
  return chunks;
}

/** Lo que se puede ofrecer para separar una colisión de un clic. */
export type QuickbooksImportCollisionResolution = {
  /** Número que separaría esta fila de su contrato base, si el backend lo derivó. */
  suggestedProjectNumber: string | null;
  /** El backend no pudo decir quién es el contrato y quién la orden de cambio. */
  indeterminate: boolean;
};

/**
 * Sólo la orden de cambio se mueve: el contrato base se queda con su número.
 * Cuando el nombre del job trae el marcador pero sin ordinal (`C.O.` suelto), el
 * backend no puede proponer número y hay que escribirlo a mano.
 */
export function resolveCollision(
  job: QuickbooksImportJob,
): QuickbooksImportCollisionResolution | null {
  if (job.collidesWith.length === 0) return null;
  return {
    suggestedProjectNumber:
      job.role === "orden_de_cambio" ? job.suggestedProjectNumber : null,
    indeterminate: job.role === "indeterminado",
  };
}
