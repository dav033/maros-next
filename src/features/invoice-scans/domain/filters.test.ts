import { describe, expect, it } from "vitest";

import type { ExtractedInvoiceData, InvoiceScan } from "./models";
import { filterInvoiceScans } from "./filters";

function scan(overrides: Partial<InvoiceScan> = {}): InvoiceScan {
  return {
    id: "scan-1",
    recordType: "invoice",
    fileName: "Factura.pdf",
    contentType: "application/pdf",
    status: "needs_review",
    extractedData: null,
    qboSuggestions: {},
    errorMessage: null,
    projectNumber: "PR-101",
    comments: null,
    warnings: [],
    enteredAt: null,
    enteredBy: null,
    updatedBy: null,
    createdAt: "2026-10-01T12:00:00Z",
    updatedAt: "2026-10-01T12:00:00Z",
    ...overrides,
  };
}

function extractedData(overrides: Partial<ExtractedInvoiceData> = {}): ExtractedInvoiceData {
  return {
    direction: "incoming",
    classification: "materials_expense",
    counterpartyName: "Ferretería El Roble",
    invoiceNumber: "FAC-42",
    issueDate: "2026-09-15",
    dueDate: null,
    currency: "USD",
    subtotal: 100,
    taxTotal: 19,
    total: 119,
    paymentStatus: "unpaid",
    confidence: 0.9,
    lineItems: [],
    ...overrides,
  };
}

describe("filterInvoiceScans", () => {
  it("matches free text across title, counterparty, invoice number, project number and comments without case or accents", () => {
    const invoice = scan({ extractedData: extractedData(), comments: "Revisar Rápido" });

    for (const search of ["factura", "FERRETERIA", "fac-42", "pr-101", "rapido"]) {
      expect(filterInvoiceScans([invoice], { search })).toEqual([invoice]);
    }
    expect(filterInvoiceScans([invoice], { search: "missing" })).toEqual([]);
  });

  it("filters by record type, money direction, status and classification", () => {
    const invoice = scan({ extractedData: extractedData() });
    const transaction = scan({
      id: "transaction-1",
      recordType: "transaction",
      status: "failed",
      extractedData: extractedData({ transactionDirection: "payment_received", classification: "other" }),
    });

    expect(filterInvoiceScans([invoice, transaction], { recordType: "transaction" })).toEqual([transaction]);
    expect(filterInvoiceScans([scan({ recordType: undefined })], { recordType: "invoice" })).toHaveLength(1);
    expect(filterInvoiceScans([invoice, transaction], { moneyDirection: "out" })).toEqual([invoice]);
    expect(filterInvoiceScans([invoice, transaction], { moneyDirection: "in" })).toEqual([transaction]);
    expect(filterInvoiceScans([invoice, transaction], { status: "failed" })).toEqual([transaction]);
    expect(filterInvoiceScans([invoice, transaction], { classification: "materials_expense" })).toEqual([invoice]);
  });

  it("handles a scan that has no extracted data yet", () => {
    const unscanned = scan({ id: "unscanned", status: "uploaded", extractedData: null, comments: "Pendiente" });

    for (const filters of [
      { status: "uploaded" as const },
      { search: "pr-101" },
      { search: "factura.pdf" },
      { search: "pendiente" },
      // Wide enough for the local day of 12:00Z in any time zone.
      { dateFrom: "2026-09-30", dateTo: "2026-10-02" },
    ]) {
      expect(filterInvoiceScans([unscanned], filters)).toEqual([unscanned]);
    }
    for (const filters of [
      { classification: "unknown" as const },
      { moneyDirection: "in" as const },
      { moneyDirection: "out" as const },
      { amountMin: 0 },
      { amountMax: 1000 },
    ]) {
      expect(filterInvoiceScans([unscanned], filters)).toEqual([]);
    }
  });

  it("uses issue date for invoices and creation date when no issue date exists", () => {
    const invoice = scan({ extractedData: extractedData({ issueDate: "2026-09-15" }) });
    const transaction = scan({
      id: "transaction-1",
      recordType: "transaction",
      createdAt: "2026-10-02T05:30:00Z",
      extractedData: extractedData({ issueDate: null, transactionDirection: "payment_made" }),
    });

    expect(filterInvoiceScans([invoice, transaction], { dateFrom: "2026-10-01", dateTo: "2026-10-02" })).toEqual([
      transaction,
    ]);
  });

  it("places a creation timestamp on the local calendar day, as the list displays it", () => {
    const originalTimeZone = process.env.TZ;
    process.env.TZ = "America/Bogota";

    try {
      // 22:30 on Oct 1 in Bogota (UTC-5) is already Oct 2 in UTC; the precondition fails loudly if TZ is ignored.
      expect(new Date("2026-10-02T03:30:00Z").getDate()).toBe(1);
      const eveningRecord = scan({
        id: "evening",
        recordType: "transaction",
        createdAt: "2026-10-02T03:30:00Z",
        extractedData: extractedData({ issueDate: null, transactionDirection: "payment_made" }),
      });

      expect(filterInvoiceScans([eveningRecord], { dateFrom: "2026-10-01", dateTo: "2026-10-01" })).toEqual([
        eveningRecord,
      ]);
      expect(filterInvoiceScans([eveningRecord], { dateFrom: "2026-10-02" })).toEqual([]);
    } finally {
      if (originalTimeZone === undefined) delete process.env.TZ;
      else process.env.TZ = originalTimeZone;
    }
  });

  it("excludes records with invalid constrained dates and totals", () => {
    const invalidDate = scan({ extractedData: extractedData({ issueDate: "2026-02-30" }) });
    const invalidCreationDate = scan({
      extractedData: extractedData({ issueDate: null }),
      createdAt: "2026-02-30T12:00:00Z",
    });
    const missingTotal = scan({ id: "missing-total", extractedData: extractedData({ total: null }) });
    const invalidTotal = scan({ id: "invalid-total", extractedData: extractedData({ total: Number.NaN }) });

    expect(filterInvoiceScans([invalidDate], { dateFrom: "2026-09-01" })).toEqual([]);
    expect(filterInvoiceScans([invalidCreationDate], { dateFrom: "2026-03-01" })).toEqual([]);
    expect(filterInvoiceScans([missingTotal, invalidTotal], { amountMin: 1 })).toEqual([]);
  });

  it("combines criteria with AND and includes amount boundaries", () => {
    const matching = scan({ extractedData: extractedData() });
    const wrongAmount = scan({ id: "wrong-amount", extractedData: extractedData({ total: 120 }) });

    expect(
      filterInvoiceScans([matching, wrongAmount], {
        status: "needs_review",
        classification: "materials_expense",
        dateFrom: "2026-09-15",
        dateTo: "2026-09-15",
        amountMin: 119,
        amountMax: 119,
      }),
    ).toEqual([matching]);
  });

  it("does not mutate the input list", () => {
    const scans = [scan(), scan({ id: "scan-2", status: "failed" })];

    expect(filterInvoiceScans(scans, { status: "failed" })).toEqual([scans[1]]);
    expect(scans.map(({ id }) => id)).toEqual(["scan-1", "scan-2"]);
  });
});
