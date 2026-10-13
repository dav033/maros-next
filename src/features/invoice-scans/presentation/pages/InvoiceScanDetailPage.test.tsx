import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { InvoiceScan } from "../../domain/models";

const mocks = vi.hoisted(() => ({
  detail: vi.fn(),
  update: vi.fn(),
  retry: vi.fn(),
  routerPush: vi.fn(),
  query: "",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.routerPush }),
  useSearchParams: () => new URLSearchParams(mocks.query),
}));
vi.mock("../hooks/useInvoiceScans", () => ({
  useInvoiceScanDetail: mocks.detail,
  useUpdateInvoiceScan: mocks.update,
  useRetryInvoiceScan: mocks.retry,
}));
vi.mock("../components/AttachDocumentPanel", () => ({ AttachDocumentPanel: () => null }));
vi.mock("../components/DeleteInvoiceScanButton", () => ({
  DeleteInvoiceScanButton: ({ onDeleted }: { onDeleted: () => void }) => <button onClick={onDeleted}>Confirm lab deletion</button>,
}));
vi.mock("../components/EnteredCheckbox", () => ({ EnteredCheckbox: () => null }));
vi.mock("../components/InvoiceDetailsForm", () => ({ InvoiceDetailsForm: () => null }));
vi.mock("../components/InvoiceDocumentPreview", () => ({ InvoiceDocumentPreview: () => null }));
vi.mock("../components/InvoiceScanWarnings", () => ({ InvoiceScanWarnings: () => null }));
vi.mock("../components/ProjectNumberSelect", () => ({ ProjectNumberSelect: () => null }));
vi.mock("../components/TransactionDetailsForm", () => ({ TransactionDetailsForm: () => null }));

import { InvoiceScanDetailPage } from "./InvoiceScanDetailPage";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.query = "";
});

function scan(comments: string | null): InvoiceScan {
  return {
    id: "scan-1",
    fileName: "invoice.pdf",
    contentType: "application/pdf",
    status: "needs_review",
    extractedData: null,
    qboSuggestions: {},
    errorMessage: null,
    projectNumber: null,
    comments,
    warnings: [],
    enteredAt: null,
    enteredBy: null,
    updatedBy: null,
    createdAt: "2026-10-10T00:00:00Z",
    updatedAt: "2026-10-10T00:00:00Z",
  };
}

function renderPage(comments: string | null) {
  mocks.detail.mockReturnValue({ data: scan(comments), isLoading: false });
  mocks.update.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  mocks.retry.mockReturnValue({ isPending: false, isError: false, mutate: vi.fn() });
  return render(<InvoiceScanDetailPage id="scan-1" />);
}

describe("InvoiceScanDetailPage reviewer comments", () => {
  it("shows saved comments when a reviewer opens the scan", () => {
    renderPage("Please confirm the total before entering this invoice.\nCheck the second page too.");

    expect(screen.getByRole("heading", { name: "Reviewer comments" })).toBeInTheDocument();
    expect(screen.getByText(/Please confirm the total before entering this invoice/)).toBeInTheDocument();
    expect(screen.getByText(/Check the second page too/)).toBeInTheDocument();
  });

  it("does not show an empty comments section", () => {
    renderPage("  \n  ");

    expect(screen.queryByRole("heading", { name: "Reviewer comments" })).not.toBeInTheDocument();
  });
});

describe("InvoiceScanDetailPage filter return", () => {
  it("keeps the plain list destination when directly visiting a detail without filters", () => {
    renderPage(null);
    expect(screen.getByRole("link", { name: "All document scans" })).toHaveAttribute("href", "/finance/invoices");
  });

  it("validates filter query values while preserving unrelated keys for the return", () => {
    mocks.query = "q=%20Lion%20&type=cheque&direction=out&status=failed&classification=materials_expense&from=2026-09-01&to=invalid&min=1e3&max=NaN&campaign=lab&returnTo=https%3A%2F%2Fexample.com";
    renderPage(null);
    const url = new URL(screen.getByRole("link", { name: "All document scans" }).getAttribute("href") ?? "", "http://127.0.0.1");
    expect(url.origin).toBe("http://127.0.0.1");
    expect(url.pathname).toBe("/finance/invoices");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      q: "Lion", direction: "out", status: "failed", classification: "materials_expense", from: "2026-09-01", min: "1000",
      campaign: "lab", returnTo: "https://example.com",
    });
  });

  it("preserves the filter return link when the detail cannot be loaded", () => {
    mocks.query = "type=invoice&min=10&campaign=lab";
    const page = renderPage(null);
    mocks.detail.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() });
    page.rerender(<InvoiceScanDetailPage id="scan-1" />);
    const url = new URL(screen.getByRole("link", { name: "All document scans" }).getAttribute("href") ?? "", "http://127.0.0.1");
    expect(url.pathname).toBe("/finance/invoices");
    expect(Object.fromEntries(url.searchParams)).toEqual({ type: "invoice", min: "10", campaign: "lab" });
    expect(screen.getByText("This document scan could not be loaded.")).toBeInTheDocument();
  });

  it("uses the same filtered destination after a successful deletion", async () => {
    mocks.query = "q=Lion&type=invoice&campaign=lab";
    renderPage(null);
    const href = screen.getByRole("link", { name: "All document scans" }).getAttribute("href");
    await userEvent.setup().click(screen.getByRole("button", { name: "Confirm lab deletion" }));
    expect(mocks.routerPush).toHaveBeenCalledWith(href);
    expect(new URL(String(href), "http://127.0.0.1").searchParams.get("q")).toBe("Lion");
  });
});
