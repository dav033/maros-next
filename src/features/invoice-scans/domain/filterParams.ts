import {
  isDateOnly,
  isInvoiceClassification,
  isInvoiceScanMoneyDirection,
  isInvoiceScanRecordType,
  isInvoiceScanStatus,
  type InvoiceScanFilters,
} from "./filters";

/** Query keys owned by the filters; every other key of the URL belongs to someone else. */
const FILTER_PARAM_KEYS = [
  "q",
  "type",
  "direction",
  "status",
  "classification",
  "from",
  "to",
  "min",
  "max",
] as const;

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

/**
 * `currentQuery` with its filter keys replaced by `filters`. Params that are
 * not filters (another feature's, tracking tags) are kept as they are, and a
 * filter key with a malformed value is dropped along with the old ones.
 */
export function applyInvoiceScanFilters(currentQuery: string, filters: InvoiceScanFilters): string {
  const params = new URLSearchParams(currentQuery);
  for (const key of FILTER_PARAM_KEYS) params.delete(key);
  for (const [key, value] of new URLSearchParams(serializeInvoiceScanFilters(filters))) {
    params.append(key, value);
  }
  return params.toString();
}
