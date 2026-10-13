import { describe, expect, it } from "vitest";

import type { InvoiceScanFilters } from "./filters";
import {
  applyInvoiceScanFilters,
  parseInvoiceScanFilters,
  serializeInvoiceScanFilters,
} from "./filterParams";

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

  describe("applyInvoiceScanFilters", () => {
    it("keeps the params that are not filters and replaces the filter ones", () => {
      expect(
        applyInvoiceScanFilters("?tab=open&status=failed&q=old&utm=a%20b", {
          status: "needs_review",
          amountMin: 10,
        }),
      ).toBe("tab=open&utm=a+b&status=needs_review&min=10");
    });

    it("removes every filter key when the filters are empty", () => {
      expect(
        applyInvoiceScanFilters(
          "q=x&type=invoice&direction=in&status=failed&classification=other&from=2026-01-01&to=2026-02-01&min=1&max=2&tab=open",
          {},
        ),
      ).toBe("tab=open");
      expect(applyInvoiceScanFilters("", {})).toBe("");
    });

    it("drops a filter key whose value is malformed even when it is not touched", () => {
      expect(applyInvoiceScanFilters("status=bogus&from=2026-02-30", { search: "roof" })).toBe("q=roof");
    });

    it("is read back by parseInvoiceScanFilters", () => {
      const filters: InvoiceScanFilters = { search: "a&b=c", dateFrom: "2026-03-04", amountMax: 99.5 };

      expect(parseInvoiceScanFilters(applyInvoiceScanFilters("other=1", filters))).toEqual(filters);
    });
  });
});
