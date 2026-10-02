import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AgingBucket, ReceivableProject, ReceivablesReport } from "../../domain/types";

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/shared/infra", () => ({ optimizedApiClient: { get: api.get } }));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { ReceivablesPage } from "./ReceivablesPage";

afterEach(() => {
  cleanup();
  api.get.mockReset();
});

const EMPTY: AgingBucket = { projectCount: 0, outstandingAmount: 0, unbilledProjectCount: 0 };

function project(overrides: Partial<ReceivableProject>): ReceivableProject {
  return {
    id: 1,
    leadNumber: "050P-0826",
    name: "Alley repaving",
    billedAmount: 100000,
    collectedAmount: 20000,
    outstandingAmount: 80000,
    billedAt: "2026-05-01",
    endDate: "2026-04-20",
    daysOutstanding: 120,
    agingBucket: "over_90",
    ...overrides,
  };
}

function report(overrides: Partial<ReceivablesReport> = {}): ReceivablesReport {
  return {
    asOf: "2026-10-01",
    projects: [project({})],
    totals: {
      current: EMPTY,
      "31_60": EMPTY,
      "61_90": EMPTY,
      over_90: { projectCount: 4, outstandingAmount: 141230, unbilledProjectCount: 3 },
      unknown: EMPTY,
    },
    grandTotal: { projectCount: 4, outstandingAmount: 141230, unbilledProjectCount: 3 },
    ...overrides,
  };
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ReceivablesPage />
    </QueryClientProvider>,
  );
}

describe("ReceivablesPage", () => {
  it("shows a bucket's money and its unbilled project count together", async () => {
    api.get.mockResolvedValue({ data: report(), status: 200 });
    renderPage();

    const bucket = await screen.findByRole("group", { name: "Over 90 days" });
    expect(within(bucket).getByText("$141,230.00")).toBeInTheDocument();
    expect(within(bucket).getByText(/\+ 3 with no invoice recorded/)).toBeInTheDocument();
    // The figure cannot be read as a complete total while three projects are missing invoices.
    expect(within(bucket).getByText("at least")).toBeInTheDocument();
  });

  it("renders missing amounts as a dash, never as zero", async () => {
    api.get.mockResolvedValue({
      data: report({
        projects: [
          project({
            id: 42,
            name: "Roof tear-off",
            billedAmount: null,
            collectedAmount: null,
            outstandingAmount: null,
            billedAt: null,
            endDate: null,
            daysOutstanding: null,
            agingBucket: "unknown",
          }),
        ],
      }),
      status: 200,
    });
    renderPage();

    const link = await screen.findByRole("link", { name: "Roof tear-off" });
    const row = link.closest("tr") as HTMLElement;
    expect(within(row).queryByText("$0.00")).toBeNull();
    expect(within(row).getAllByText("—")).toHaveLength(4);
  });

  it("presents an unknown aging bucket as missing data, not as up to date", async () => {
    api.get.mockResolvedValue({
      data: report({
        projects: [
          project({
            id: 42,
            name: "Roof tear-off",
            outstandingAmount: null,
            billedAmount: null,
            collectedAmount: null,
            billedAt: null,
            endDate: null,
            daysOutstanding: null,
            agingBucket: "unknown",
          }),
        ],
        totals: {
          current: EMPTY,
          "31_60": EMPTY,
          "61_90": EMPTY,
          over_90: EMPTY,
          unknown: { projectCount: 1, outstandingAmount: 0, unbilledProjectCount: 1 },
        },
        grandTotal: { projectCount: 1, outstandingAmount: 0, unbilledProjectCount: 1 },
      }),
      status: 200,
    });
    renderPage();

    expect(await screen.findByText(/1 of 1 projects cannot be aged yet/)).toBeInTheDocument();
    expect(screen.getByText(/not the same as up to date/)).toBeInTheDocument();

    const row = screen.getByRole("link", { name: "Roof tear-off" }).closest("tr") as HTMLElement;
    const badge = within(row).getByText("No dates");
    expect(badge).toBeInTheDocument();
    expect(badge.className).not.toMatch(/emerald/);
    expect(within(row).queryByText("0–30")).toBeNull();
  });

  it("shows an empty state when nothing is pending collection", async () => {
    api.get.mockResolvedValue({
      data: report({
        projects: [],
        totals: {
          current: EMPTY,
          "31_60": EMPTY,
          "61_90": EMPTY,
          over_90: EMPTY,
          unknown: EMPTY,
        },
        grandTotal: EMPTY,
      }),
      status: 200,
    });
    renderPage();

    expect(await screen.findByText("Nothing pending collection")).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("explains a 403 as a missing permission instead of a raw error", async () => {
    api.get.mockRejectedValue({ kind: "forbidden", status: 403, message: "Forbidden" });
    renderPage();

    await waitFor(() =>
      expect(
        screen.getByText("You do not have access to collections data"),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
  });
});
