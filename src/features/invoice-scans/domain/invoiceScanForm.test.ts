import { describe, expect, it } from "vitest";

import {
  invoiceScanFormDefaults,
  invoiceScanFormSchema,
  invoiceScanFormToPatch,
} from "./invoiceScanForm";

describe("invoice scan form", () => {
  it("round-trips extracted data through the form and back to a patch", () => {
    const defaults = invoiceScanFormDefaults({
      direction: "incoming",
      classification: "materials_expense",
      counterpartyName: "Lion Plumbing",
      invoiceNumber: "4022039",
      issueDate: "2026-09-01",
      dueDate: null,
      currency: "USD",
      subtotal: 80,
      taxTotal: 7.73,
      total: 87.73,
      paymentStatus: "unpaid",
      confidence: 0.9,
      lineItems: [{ description: "Pipe", quantity: 1, unitPrice: 80, amount: 80 }],
    });

    expect(defaults.total).toBe("87.73");
    expect(defaults.dueDate).toBe("");
    expect(invoiceScanFormSchema.safeParse(defaults).success).toBe(true);

    const patch = invoiceScanFormToPatch({
      ...defaults,
      currency: "usd",
      dueDate: "2026-10-01",
      lineItems: [
        ...defaults.lineItems,
        { description: "", quantity: "", unitPrice: "", amount: "" },
      ],
    });

    expect(patch).toEqual({
      direction: "incoming",
      classification: "materials_expense",
      counterpartyName: "Lion Plumbing",
      invoiceNumber: "4022039",
      issueDate: "2026-09-01",
      dueDate: "2026-10-01",
      currency: "USD",
      paymentStatus: "unpaid",
      subtotal: 80,
      taxTotal: 7.73,
      total: 87.73,
      lineItems: [{ description: "Pipe", quantity: 1, unitPrice: 80, amount: 80 }],
    });
  });

  it("rejects malformed dates, currencies and negative amounts", () => {
    const result = invoiceScanFormSchema.safeParse({
      ...invoiceScanFormDefaults(null),
      issueDate: "09/01/2026",
      currency: "dollars",
      total: "-1",
    });
    expect(result.success).toBe(false);
    const paths = result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
    expect(paths).toEqual(expect.arrayContaining(["issueDate", "currency", "total"]));
  });
});
