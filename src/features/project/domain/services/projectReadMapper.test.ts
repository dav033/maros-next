import { describe, expect, it } from "vitest";

import { mapProjectFromDTO } from "./projectReadMapper";

const lead = { id: 7, name: "Renovation Surfside", leadNumber: "045-0925", notes: [] };
const leadMapper = (dto: { id: number; name: string; leadNumber: string }) => ({
  ...dto,
  notes: [],
}) as never;

function projectWithSchedule(schedule: unknown) {
  return mapProjectFromDTO(
    {
      id: 86,
      notes: [],
      leadId: 7,
      lead,
      financial: {
        projectNumber: "045-0925",
        estimatedAmount: 199052.73,
        estimateCount: 2,
        invoicedAmount: 199248.3,
        invoiceCount: 3,
        paidAmount: 14975.08,
        outstandingAmount: 184273.22,
        paidPercentage: 7.52,
        estimateVsInvoicedDelta: -195.57,
        totalJobCost: 120000,
        grossProfit: 79248.3,
        cashOutPaid: 51000,
        paymentSchedule: schedule,
      },
    } as never,
    leadMapper,
  );
}

describe("normalizePaymentSchedule", () => {
  it("conserva los hitos de monto fijo, que no traen porcentaje", () => {
    const project = projectWithSchedule({
      items: [
        { label: "Payment No. 1 – Permit Documentation", percentage: null, amount: 5000, basis: "total" },
        {
          label: "Payment No. 2 – Mobilization",
          percentage: 35,
          amount: 66245.63,
          basis: "remaining-balance",
        },
      ],
      totalPercentage: 100,
      totalAmount: 71245.63,
      basis: "remaining-balance",
      source: {
        attachmentId: "9001",
        fileName: "Proposal 045-0925.pdf",
        entityType: "Invoice",
        entityId: "3965",
        matchedBy: "invoice",
      },
    });

    expect(project.financial?.paymentSchedule?.items).toHaveLength(2);
    expect(project.financial?.paymentSchedule?.items[0].percentage).toBeNull();
    expect(project.financial?.paymentSchedule?.items[0].amount).toBe(5000);
    expect(project.financial?.paymentSchedule?.basis).toBe("remaining-balance");
    expect(project.financial?.totalJobCost).toBe(120000);
    expect(project.financial?.grossProfit).toBe(79248.3);
    expect(project.financial?.cashOutPaid).toBe(51000);
  });

  it("acepta un match por nombre de archivo, que no trae entidad de origen", () => {
    const project = projectWithSchedule({
      items: [{ label: "Contract Execution", percentage: 15, amount: 21420 }],
      totalPercentage: 100,
      totalAmount: 142800,
      basis: "total",
      source: {
        attachmentId: "9002",
        fileName: "CONSTRUCTION AGREEMENT - 061-0226.pdf",
        entityType: null,
        entityId: null,
        matchedBy: "file-name",
      },
    });

    expect(project.financial?.paymentSchedule?.source.matchedBy).toBe("file-name");
    expect(project.financial?.paymentSchedule?.source.entityType).toBeNull();
  });

  it("descarta filas sin porcentaje ni monto", () => {
    const project = projectWithSchedule({
      items: [{ label: "Notas del contrato", percentage: null, amount: null }],
      totalPercentage: null,
      totalAmount: null,
      basis: "total",
      source: { attachmentId: "9003", fileName: "x.pdf", entityType: "Estimate", entityId: "1", matchedBy: "estimate" },
    });

    expect(project.financial?.paymentSchedule).toBeUndefined();
  });
});
