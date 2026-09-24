import { describe, expect, it } from "vitest";

import type { InvoiceScan } from "./models";
import { canMarkEntered, partitionInvoiceScans } from "./partition";

function scan(overrides: Partial<InvoiceScan>): InvoiceScan {
  return {
    id: "x",
    fileName: "x.pdf",
    contentType: "application/pdf",
    status: "needs_review",
    extractedData: null,
    qboSuggestions: {},
    errorMessage: null,
    projectNumber: null,
    comments: null,
    warnings: [],
    enteredAt: null,
    enteredBy: null,
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

describe("partitionInvoiceScans", () => {
  it("splits entered scans from pending ones and orders each bucket", () => {
    const buckets = partitionInvoiceScans([
      scan({ id: "old-pending", createdAt: "2026-09-01T00:00:00Z" }),
      scan({ id: "done-first", enteredAt: "2026-09-10T00:00:00Z" }),
      scan({ id: "new-pending", createdAt: "2026-09-05T00:00:00Z", status: "failed" }),
      scan({ id: "done-last", enteredAt: "2026-09-12T00:00:00Z" }),
    ]);

    expect(buckets.pending.map((s) => s.id)).toEqual(["new-pending", "old-pending"]);
    expect(buckets.completed.map((s) => s.id)).toEqual(["done-last", "done-first"]);
  });
});

describe("canMarkEntered", () => {
  it("only allows scans that have details", () => {
    expect(canMarkEntered({ status: "needs_review" })).toBe(true);
    expect(canMarkEntered({ status: "failed" })).toBe(false);
    expect(canMarkEntered({ status: "uploaded" })).toBe(false);
  });
});
