import { invoiceTitle, moneyFlow } from "./labels";
import type {
  InvoiceClassification,
  InvoiceScan,
  InvoiceScanRecordType,
  InvoiceScanStatus,
} from "./models";

export interface InvoiceScanFilters {
  search?: string;
  recordType?: InvoiceScanRecordType;
  moneyDirection?: "in" | "out";
  status?: InvoiceScanStatus;
  classification?: InvoiceClassification;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

const scanStatuses: readonly InvoiceScanStatus[] = [
  "uploaded",
  "processing",
  "needs_review",
  "failed",
];

const classifications: readonly InvoiceClassification[] = [
  "customer_service",
  "materials_expense",
  "subcontractor_expense",
  "other",
  "unknown",
];

const recordTypes: readonly InvoiceScanRecordType[] = ["invoice", "transaction"];

function isOneOf<T extends string>(value: string, options: readonly T[]): value is T {
  return options.includes(value as T);
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isValidDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function scanDate(scan: InvoiceScan): string | null {
  const issueDate = scan.extractedData?.issueDate;
  if (issueDate) return isValidDateOnly(issueDate) ? issueDate : null;

  if (!isValidDateOnly(scan.createdAt.slice(0, 10))) return null;
  const createdAt = new Date(scan.createdAt);
  if (Number.isNaN(createdAt.getTime())) return null;

  // Local calendar day, like `formatDate` shows it: the UTC day would move an
  // evening record to tomorrow for any user west of UTC.
  const month = String(createdAt.getMonth() + 1).padStart(2, "0");
  const day = String(createdAt.getDate()).padStart(2, "0");
  return `${createdAt.getFullYear()}-${month}-${day}`;
}

function matchesSearch(scan: InvoiceScan, search: string): boolean {
  const extractedData = scan.extractedData;
  const searchableText = [
    invoiceTitle(scan),
    scan.fileName,
    extractedData?.counterpartyName,
    extractedData?.invoiceNumber,
    scan.projectNumber,
    scan.comments,
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizeText);

  return searchableText.some((value) => value.includes(search));
}

function matchesDateRange(scan: InvoiceScan, filters: InvoiceScanFilters): boolean {
  const dateFrom = filters.dateFrom && isValidDateOnly(filters.dateFrom) ? filters.dateFrom : undefined;
  const dateTo = filters.dateTo && isValidDateOnly(filters.dateTo) ? filters.dateTo : undefined;
  if (!dateFrom && !dateTo) return true;

  const date = scanDate(scan);
  if (!date) return false;
  return (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
}

function matchesAmountRange(scan: InvoiceScan, filters: InvoiceScanFilters): boolean {
  const amountMin = Number.isFinite(filters.amountMin) ? filters.amountMin : undefined;
  const amountMax = Number.isFinite(filters.amountMax) ? filters.amountMax : undefined;
  if (amountMin === undefined && amountMax === undefined) return true;

  const total = scan.extractedData?.total;
  if (total === null || total === undefined || !Number.isFinite(total)) return false;
  return (amountMin === undefined || total >= amountMin) && (amountMax === undefined || total <= amountMax);
}

export function filterInvoiceScans(
  scans: readonly InvoiceScan[],
  filters: InvoiceScanFilters,
): InvoiceScan[] {
  const search = filters.search ? normalizeText(filters.search.trim()) : "";

  return scans.filter((scan) => {
    if (search && !matchesSearch(scan, search)) return false;
    if (filters.recordType && (scan.recordType ?? "invoice") !== filters.recordType) return false;
    if (filters.moneyDirection && moneyFlow(scan) !== filters.moneyDirection) return false;
    if (filters.status && scan.status !== filters.status) return false;
    if (filters.classification && scan.extractedData?.classification !== filters.classification) return false;
    if (!matchesDateRange(scan, filters)) return false;
    return matchesAmountRange(scan, filters);
  });
}

export const isInvoiceScanRecordType = (value: string): value is InvoiceScanRecordType =>
  isOneOf(value, recordTypes);

export const isInvoiceScanMoneyDirection = (value: string): value is "in" | "out" =>
  isOneOf(value, ["in", "out"]);

export const isInvoiceScanStatus = (value: string): value is InvoiceScanStatus =>
  isOneOf(value, scanStatuses);

export const isInvoiceClassification = (value: string): value is InvoiceClassification =>
  isOneOf(value, classifications);

export const isDateOnly = isValidDateOnly;
