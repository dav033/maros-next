import { moneyFlow } from "./labels";
import type { InvoiceClassification, InvoiceScan, InvoiceScanStatus } from "./models";

export interface InvoiceScanFilters {
  search: string;
  searchField: "all" | "invoiceNumber" | "description" | "counterparty" | "project" | "fileName" | "comments";
  entry: "all" | "pending" | "entered";
  recordType: "all" | "invoice" | "transaction";
  flow: "all" | "in" | "out" | "unknown";
  classification: "all" | InvoiceClassification;
  status: "all" | InvoiceScanStatus;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

export const EMPTY_INVOICE_SCAN_FILTERS: InvoiceScanFilters = {
  search: "", searchField: "all", entry: "all", recordType: "all", flow: "all",
  classification: "all", status: "all", dateFrom: "", dateTo: "", amountMin: "", amountMax: "",
};

export function invoiceScanFilterError(filters: InvoiceScanFilters): string | null {
  if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
    return "The start date must be on or before the end date.";
  }
  const min = filters.amountMin.trim() === "" ? null : Number(filters.amountMin);
  const max = filters.amountMax.trim() === "" ? null : Number(filters.amountMax);
  if ((min !== null && !Number.isFinite(min)) || (max !== null && !Number.isFinite(max))) {
    return "Enter valid amounts.";
  }
  if (min !== null && max !== null && min > max) {
    return "The minimum amount must not exceed the maximum.";
  }
  return null;
}

export function filterInvoiceScans(scans: InvoiceScan[], filters: InvoiceScanFilters): InvoiceScan[] {
  if (invoiceScanFilterError(filters)) return [];
  const terms = filters.search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const min = filters.amountMin.trim() === "" ? null : Number(filters.amountMin);
  const max = filters.amountMax.trim() === "" ? null : Number(filters.amountMax);

  return scans.filter((scan) => {
    const data = scan.extractedData;
    const fields = {
      invoiceNumber: data?.invoiceNumber,
      description: data?.description,
      counterparty: data?.counterpartyName,
      project: scan.projectNumber,
      fileName: scan.fileName,
      comments: scan.comments,
    };
    const text = (filters.searchField === "all" ? Object.values(fields).join(" ") : fields[filters.searchField] ?? "").toLocaleLowerCase();
    if (!terms.every((term) => text.includes(term))) return false;
    if (filters.entry === "pending" && scan.enteredAt) return false;
    if (filters.entry === "entered" && !scan.enteredAt) return false;
    if (filters.recordType !== "all" && (scan.recordType ?? "invoice") !== filters.recordType) return false;
    if (filters.flow !== "all" && moneyFlow(scan) !== filters.flow) return false;
    if (filters.classification !== "all" && (data?.classification ?? "unknown") !== filters.classification) return false;
    if (filters.status !== "all" && scan.status !== filters.status) return false;
    // Issue date is the transaction date for manual entries. Missing dates stay
    // unknown instead of silently substituting the upload/QuickBooks entry date.
    const date = data?.issueDate?.slice(0, 10);
    if (filters.dateFrom && (!date || date < filters.dateFrom)) return false;
    if (filters.dateTo && (!date || date > filters.dateTo)) return false;
    if (min !== null || max !== null) {
      const amount = data?.total;
      if (amount === null || amount === undefined || !Number.isFinite(amount)) return false;
      if (min !== null && amount < min) return false;
      if (max !== null && amount > max) return false;
    }
    return true;
  });
}
