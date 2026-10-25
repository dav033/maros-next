import { describe, expect, it } from "vitest";
import { EMPTY_INVOICE_SCAN_FILTERS as empty, filterInvoiceScans, invoiceScanFilterError } from "./filters";
import type { InvoiceScanFilters } from "./filters";
import type { InvoiceScan } from "./models";

function scan(overrides: Partial<InvoiceScan> = {}): InvoiceScan {
  return {
    id: "invoice", fileName: "Receipt.pdf", status: "needs_review", contentType: "application/pdf",
    extractedData: {
      direction: "incoming", classification: "materials_expense", counterpartyName: "Lion Plumbing",
      invoiceNumber: "INV-42", issueDate: "2026-09-10", dueDate: null, currency: "USD",
      subtotal: null, taxTotal: null, total: 100, paymentStatus: "unpaid", confidence: 1, lineItems: [],
    },
    projectNumber: "050P-0826", comments: "Missing purchase order", warnings: [], qboSuggestions: {},
    errorMessage: null, enteredAt: null, enteredBy: null, updatedBy: null,
    createdAt: "2026-09-12T00:00:00Z", updatedAt: "2026-09-12T00:00:00Z", ...overrides,
  };
}

const matches = (row: InvoiceScan, filters: Partial<InvoiceScanFilters>) => filterInvoiceScans([row], { ...empty, ...filters }).length === 1;

describe("invoice scan filters", () => {
  it("keeps all records by default without changing their order or data", () => {
    const rows = [scan(), scan({ id: "entered", enteredAt: "2026-09-11" }), scan({ id: "failed", extractedData: null, status: "failed" })];
    expect(filterInvoiceScans(rows, empty)).toEqual(rows);
  });

  it.each([
    ["invoiceNumber", "inv-42"], ["counterparty", "  LION plumbing  "], ["project", "050p"],
    ["fileName", "receipt.pdf"], ["comments", "purchase order"],
  ] as const)("searches %s case-insensitively", (searchField, search) => {
    expect(matches(scan(), { searchField, search })).toBe(true);
  });

  it("requires every search term and allows terms across fields only in all-fields mode", () => {
    expect(matches(scan(), { search: "Lion 050P" })).toBe(true);
    expect(matches(scan(), { search: "Lion absent" })).toBe(false);
    expect(matches(scan(), { search: "Lion", searchField: "invoiceNumber" })).toBe(false);
  });

  it("searches manual descriptions and treats legacy records as invoices", () => {
    const row = scan();
    const manual = scan({ recordType: "transaction", extractedData: { ...row.extractedData!, description: "Roof deposit", transactionDirection: "payment_received" } });
    expect(matches(manual, { searchField: "description", search: "deposit", flow: "in", recordType: "transaction" })).toBe(true);
    expect(matches(row, { recordType: "invoice", flow: "out" })).toBe(true);
    expect(matches(manual, { flow: "out" })).toBe(false);
  });

  it("combines filters across pending and completed records", () => {
    expect(matches(scan(), { search: "lion", entry: "pending", status: "needs_review", classification: "materials_expense", flow: "out" })).toBe(true);
    expect(matches(scan(), { entry: "entered" })).toBe(false);
    expect(matches(scan({ enteredAt: "2026-09-11" }), { entry: "entered" })).toBe(true);
    expect(matches(scan(), { classification: "other" })).toBe(false);
    expect(matches(scan(), { status: "failed" })).toBe(false);
  });

  it("includes both date and amount endpoints, including zero", () => {
    expect(matches(scan(), { dateFrom: "2026-09-10", dateTo: "2026-09-10", amountMin: "100", amountMax: "100" })).toBe(true);
    expect(matches(scan(), { dateFrom: "2026-09-11" })).toBe(false);
    expect(matches(scan(), { dateTo: "2026-09-09" })).toBe(false);
    expect(matches(scan(), { amountMin: "101" })).toBe(false);
    const row = scan();
    expect(matches(scan({ extractedData: { ...row.extractedData!, total: 0 } }), { amountMin: "0", amountMax: "0" })).toBe(true);
  });

  it("does not fabricate dates or amounts for records without extracted data", () => {
    const row = scan({ extractedData: null });
    expect(matches(row, { flow: "unknown", classification: "unknown" })).toBe(true);
    expect(matches(row, { dateFrom: "2026-09-01" })).toBe(false);
    expect(matches(row, { amountMin: "0" })).toBe(false);
    expect(matches(row, { search: "Lion" })).toBe(false);
  });

  it("reports reversed or invalid ranges and returns no misleading results", () => {
    for (const invalid of [{ dateFrom: "2026-09-11", dateTo: "2026-09-10" }, { amountMin: "2", amountMax: "1" }, { amountMin: "NaN" }]) {
      expect(invoiceScanFilterError({ ...empty, ...invalid })).toBeTruthy();
      expect(filterInvoiceScans([scan()], { ...empty, ...invalid })).toEqual([]);
    }
  });
});
