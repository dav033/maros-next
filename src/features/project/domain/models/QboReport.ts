/**
 * Reportes que acepta GET /projects/:id/qbo-report. El backend traduce estos
 * nombres a los de QuickBooks (GeneralLedgerDetail se consulta como
 * GeneralLedger), así que aquí sólo viajan los valores del contrato HTTP.
 */
export const QBO_REPORT_NAMES = [
  "ProfitAndLossDetail",
  "ProfitAndLoss",
  "GeneralLedgerDetail",
  "AgedPayables",
  "VendorExpenses",
  "VendorBalanceDetail",
  "CashFlow",
  "BalanceSheet",
] as const;

export type QboReportName = (typeof QBO_REPORT_NAMES)[number];

export const QBO_ACCOUNTING_METHODS = ["Accrual", "Cash"] as const;

export type QboAccountingMethod = (typeof QBO_ACCOUNTING_METHODS)[number];

/**
 * Reportes a fecha de corte: el backend manda `endDate` como `report_date` y no
 * exige `startDate`. El resto son de rango y requieren ambas fechas.
 */
const POINT_IN_TIME_REPORTS: readonly QboReportName[] = ["AgedPayables", "BalanceSheet"];

export function isPointInTimeReport(report: QboReportName): boolean {
  return POINT_IN_TIME_REPORTS.includes(report);
}

export type QboReportParams = {
  report: QboReportName;
  accountingMethod: QboAccountingMethod;
  startDate?: string;
  endDate?: string;
};

/** Celda de una fila, tal cual la entrega QuickBooks. */
export interface QboReportColData {
  value?: string;
  id?: string;
  href?: string;
}

export interface QboReportColumn {
  ColTitle?: string;
  ColType?: string;
}

/**
 * Fila del reporte. QuickBooks devuelve un árbol: una fila es de datos
 * (`ColData`) o una sección con encabezado, filas hijas y resumen.
 */
export interface QboReportRow {
  type?: string;
  group?: string;
  ColData?: QboReportColData[];
  Header?: { ColData?: QboReportColData[] };
  Summary?: { ColData?: QboReportColData[] };
  Rows?: { Row?: QboReportRow[] };
}

/** Payload de QuickBooks sin tocar: el backend lo devuelve verbatim en `raw`. */
export interface QboRawReport {
  Header?: Record<string, unknown>;
  Columns?: { Column?: QboReportColumn[] };
  Rows?: { Row?: QboReportRow[] };
}

/**
 * Alcance real de las cifras. QuickBooks sólo acepta el filtro `customer` en
 * algunos reportes: en los demás ignora el parámetro y responde con los números
 * de toda la empresa. El backend lo declara por reporte y la pantalla lo avisa,
 * para no presentar cifras de la empresa como si fueran del proyecto.
 */
export type QboReportScope = "project" | "company";

/**
 * De dónde salió el cliente de QuickBooks con el que se pidió el reporte:
 * `stored` es el vínculo guardado en el proyecto (`qboCustomerId`);
 * `project-number` es el job que el backend resolvió por número de proyecto
 * porque no había vínculo guardado — el mismo camino que usa el resto de la
 * ficha. El backend no persiste esa coincidencia: enlazarla es un acto
 * explícito desde la ficha del proyecto.
 */
export type QboReportLinkSource = "stored" | "project-number";

export interface ProjectQboReport {
  projectId: number;
  leadNumber: string | null;
  qboCustomerId: string;
  /** Opcional por compatibilidad con respuestas anteriores del backend. */
  linkSource?: QboReportLinkSource;
  report: QboReportName;
  accountingMethod: QboAccountingMethod;
  scope?: QboReportScope;
  startDate: string | null;
  endDate: string | null;
  raw: QboRawReport;
}
