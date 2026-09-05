import { describe, expect, it } from "vitest";

import { InvoiceStatus } from "@/project/domain";

import { mapFinancialsFromApi, mapProjectFromApi } from "./mappers";

const baseProject = {
  id: 42,
  notes: [],
  leadId: 7,
  lead: {
    id: 7,
    name: "Kitchen renovation",
    leadNumber: "PR-007",
    notes: [],
  },
};

describe("mapProjectFromApi", () => {
  it("normalizes a project id returned as a string", () => {
    const project = mapProjectFromApi({
      ...baseProject,
      id: "42" as unknown as number,
    });

    expect(project.id).toBe(42);
  });

  it("preserves the canonical company client used by the projects table", () => {
    const project = mapProjectFromApi({
      ...baseProject,
      client: {
        id: 12,
        type: "company",
        name: "Acme Construction",
        isClient: true,
        isCustomer: false,
      },
    });

    expect(project.client).toEqual({
      id: 12,
      type: "company",
      name: "Acme Construction",
      isClient: true,
      isCustomer: false,
    });
  });

  it("returns null for an invalid client payload", () => {
    const project = mapProjectFromApi({
      ...baseProject,
      client: { id: "12" } as unknown as { id: number },
    });

    expect(project.client).toBeNull();
  });
});

describe("mapFinancialsFromApi", () => {
  it("normalizes numeric project ids returned as strings", () => {
    const [entry] = mapFinancialsFromApi([
      {
        id: "42",
        financial: {
          projectNumber: "PR-007",
          estimatedAmount: 100,
          estimateCount: 1,
          invoicedAmount: 100,
          invoiceCount: 1,
          paidAmount: 50,
          outstandingAmount: 50,
          paidPercentage: 50,
          estimateVsInvoicedDelta: 0,
        },
        qbo: { data: null },
      },
    ]);

    expect(entry?.id).toBe(42);
  });

  it("omite las filas que el backend no alcanzó a enriquecer (timeout)", () => {
    // `qbo: null` = findAllFinancials cortó a los 25s sin tocar esa fila. Si se
    // mapeara como fila vacía, el refetch periódico borraría los montos que la
    // tabla ya tenía.
    const entries = mapFinancialsFromApi([
      { id: 1, financial: null, qbo: null },
      { id: 2, financial: null, qbo: { data: null } },
    ]);

    expect(entries.map((entry) => entry.id)).toEqual([2]);
  });

  it("sube paymentSummary e invoiceStatus fuera de financial", () => {
    const [entry] = mapFinancialsFromApi([
      {
        id: 111,
        financial: {
          projectNumber: "088-0626",
          found: true,
          estimatedAmount: 300,
          estimateCount: 1,
          invoicedAmount: 300,
          invoiceCount: 1,
          paidAmount: 300,
          outstandingAmount: 0,
          paidPercentage: 100,
          estimateVsInvoicedDelta: 0,
          paymentSummary: {
            count: 1,
            totalAmount: 300,
            lastPaymentDate: "2026-06-06",
            hasDetails: true,
          },
          invoiceStatus: "PAID",
        },
        qbo: { data: null },
      },
    ]);

    expect(entry.id).toBe(111);
    expect(entry.financial?.estimatedAmount).toBe(300);
    expect(entry.paymentSummary).toEqual({
      count: 1,
      totalAmount: 300,
      lastPaymentDate: "2026-06-06",
      hasDetails: true,
    });
    expect(entry.invoiceStatus).toBe(InvoiceStatus.PAID);
  });

  it("deja la fila vacía cuando el proyecto no existe en QuickBooks", () => {
    const [entry] = mapFinancialsFromApi([{ id: 143, financial: null, qbo: { data: null } }]);

    expect(entry).toEqual({
      id: 143,
      financial: null,
      paymentSummary: null,
      invoiceStatus: undefined,
      qboError: undefined,
    });
  });
});
