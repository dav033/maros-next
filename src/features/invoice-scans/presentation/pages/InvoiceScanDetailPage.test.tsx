import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { InvoiceScan } from "../../domain/models";

const mocks = vi.hoisted(() => ({
  detail: vi.fn(),
  update: vi.fn(),
  retry: vi.fn(),
  routerPush: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.routerPush }),
}));
vi.mock("../hooks/useInvoiceScans", () => ({
  useInvoiceScanDetail: mocks.detail,
  useUpdateInvoiceScan: mocks.update,
  useRetryInvoiceScan: mocks.retry,
}));
vi.mock("../components/AttachDocumentPanel", () => ({ AttachDocumentPanel: () => null }));
vi.mock("../components/DeleteInvoiceScanButton", () => ({ DeleteInvoiceScanButton: () => null }));
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
  render(<InvoiceScanDetailPage id="scan-1" />);
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
