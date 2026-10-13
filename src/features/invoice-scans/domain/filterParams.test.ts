import { describe, expect, it } from "vitest";

import type { InvoiceScanFilters } from "./filters";
import { parseInvoiceScanFilters, serializeInvoiceScanFilters } from "./filterParams";

describe("invoice scan filter query params", () => {
  it("round-trips all supported criteria through a query string", () => {
    const filters: InvoiceScanFilters = {
      search: "Café FAC-42",
      recordType: "transaction",
      moneyDirection: "in",
      status: "failed",
      classification: "other",
      dateFrom: "2026-01-02",
      dateTo: "2026-10-12",
      amountMin: -12.5,
      amountMax: 500,
    };

    expect(parseInvoiceScanFilters(serializeInvoiceScanFilters(filters))).toEqual(filters);
  });

  it("ignores unknown keys and malformed values while keeping valid criteria", () => {
    expect(
      parseInvoiceScanFilters(
        "?q=%20Ferreteria%20&type=cheque&direction=sideways&status=done&classification=unknown" +
          "&from=2026-02-30&to=2026-02-28&min=Infinity&max=0&extra=value",
      ),
    ).toEqual({ search: "Ferreteria", classification: "unknown", dateTo: "2026-02-28", amountMax: 0 });
  });

  it("serializes an empty filter set as an empty query string", () => {
    expect(serializeInvoiceScanFilters({})).toBe("");
    expect(parseInvoiceScanFilters("")).toEqual({});
  });

  it("round-trips finite amount bounds serialized in scientific notation", () => {
    const filters: InvoiceScanFilters = { amountMin: 0.0000001, amountMax: 1e21 };

    expect(parseInvoiceScanFilters(serializeInvoiceScanFilters(filters))).toEqual(filters);
  });
});
