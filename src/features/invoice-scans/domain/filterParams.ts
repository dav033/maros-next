import {
  isDateOnly,
  isInvoiceClassification,
  isInvoiceScanMoneyDirection,
  isInvoiceScanRecordType,
  isInvoiceScanStatus,
  type InvoiceScanFilters,
} from "./filters";

function parseAmount(value: string | null): number | undefined {
  if (!value || !/^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) return undefined;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : undefined;
}

export function parseInvoiceScanFilters(query: string): InvoiceScanFilters {
  const params = new URLSearchParams(query);
  const filters: InvoiceScanFilters = {};
  const search = params.get("q")?.trim();
  const recordType = params.get("type");
  const moneyDirection = params.get("direction");
  const status = params.get("status");
  const classification = params.get("classification");
  const dateFrom = params.get("from");
  const dateTo = params.get("to");
  const amountMin = parseAmount(params.get("min"));
  const amountMax = parseAmount(params.get("max"));

  if (search) filters.search = search;
  if (recordType && isInvoiceScanRecordType(recordType)) filters.recordType = recordType;
  if (moneyDirection && isInvoiceScanMoneyDirection(moneyDirection)) filters.moneyDirection = moneyDirection;
  if (status && isInvoiceScanStatus(status)) filters.status = status;
  if (classification && isInvoiceClassification(classification)) filters.classification = classification;
  if (dateFrom && isDateOnly(dateFrom)) filters.dateFrom = dateFrom;
  if (dateTo && isDateOnly(dateTo)) filters.dateTo = dateTo;
  if (amountMin !== undefined) filters.amountMin = amountMin;
  if (amountMax !== undefined) filters.amountMax = amountMax;

  return filters;
}

export function serializeInvoiceScanFilters(filters: InvoiceScanFilters): string {
  const params = new URLSearchParams();
  const search = filters.search?.trim();

  if (search) params.set("q", search);
  if (filters.recordType && isInvoiceScanRecordType(filters.recordType)) params.set("type", filters.recordType);
  if (filters.moneyDirection && isInvoiceScanMoneyDirection(filters.moneyDirection)) {
    params.set("direction", filters.moneyDirection);
  }
  if (filters.status && isInvoiceScanStatus(filters.status)) params.set("status", filters.status);
  if (filters.classification && isInvoiceClassification(filters.classification)) {
    params.set("classification", filters.classification);
  }
  if (filters.dateFrom && isDateOnly(filters.dateFrom)) params.set("from", filters.dateFrom);
  if (filters.dateTo && isDateOnly(filters.dateTo)) params.set("to", filters.dateTo);
  if (Number.isFinite(filters.amountMin)) params.set("min", String(filters.amountMin));
  if (Number.isFinite(filters.amountMax)) params.set("max", String(filters.amountMax));

  return params.toString();
}
