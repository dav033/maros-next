import { describe, expect, it } from "vitest";

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
      },
    ]);

    expect(entry?.id).toBe(42);
  });
});
