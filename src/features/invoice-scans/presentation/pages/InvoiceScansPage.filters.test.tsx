import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { InvoiceScan } from "../../domain/models";

const api = vi.hoisted(() => ({ listInvoiceScans: vi.fn() }));
vi.mock("../../infra/invoiceScansApi", () => ({
  listInvoiceScans: api.listInvoiceScans,
  updateInvoiceScan: vi.fn(),
  deleteInvoiceScan: vi.fn(),
  getInvoiceScanDownloadUrl: vi.fn(),
  listProjectsForPicker: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/features/users/presentation/hooks/data/useUserDirectory", () => ({
  useUserDirectory: () => ({ users: [], isLoading: false }),
}));
vi.mock("../components/NewTransactionDialog", () => ({ NewTransactionDialog: () => null }));
vi.mock("next/navigation", async () => {
  const { useSyncExternalStore } = await import("react");
  return {
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
    useSearchParams: () => {
      const query = useSyncExternalStore(
        (onChange) => {
          window.addEventListener("popstate", onChange);
          return () => window.removeEventListener("popstate", onChange);
        },
        () => window.location.search,
      );
      return new URLSearchParams(query);
    },
  };
});

import { InvoiceScansPage } from "./InvoiceScansPage";

beforeEach(() => {
  window.history.replaceState(null, "", "/finance/invoices");
  const replaceState = window.history.replaceState.bind(window.history);
  // Next integrates native history updates with useSearchParams; jsdom does not.
  vi.spyOn(window.history, "replaceState").mockImplementation((data, unused, url) => {
    replaceState(data, unused, url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function scan(overrides: Partial<InvoiceScan>): InvoiceScan {
  return {
    id: "pending",
    fileName: "Lion plumbing.pdf",
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
    updatedBy: null,
    createdAt: "2026-09-02T12:00:00Z",
    updatedAt: "2026-09-02T12:00:00Z",
    ...overrides,
  };
}

function renderPage(scans: InvoiceScan[], query = "", error?: Error) {
  window.history.replaceState(null, "", `/finance/invoices${query}`);
  api.listInvoiceScans.mockImplementation(() => error ? Promise.reject(error) : Promise.resolve(scans));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <InvoiceScansPage />
    </QueryClientProvider>,
  );
}

describe("InvoiceScansPage filters", () => {
  it("filters both sections from the URL and clears only filter parameters", async () => {
    renderPage([
      scan({ id: "pending-lion" }),
      scan({ id: "done-lion", enteredAt: "2026-09-03T12:00:00Z" }),
      scan({ id: "pending-other", fileName: "Other.pdf" }),
      scan({ id: "done-other", fileName: "Other.pdf", enteredAt: "2026-09-03T12:00:00Z" }),
    ], "?q=lion&campaign=lab&campaign=invoice#pending");

    expect(await screen.findByText("2 of 4")).toHaveAttribute("aria-live", "polite");
    const pending = screen.getByRole("region", { name: /to enter/i });
    const completed = screen.getByRole("region", { name: /entered in quickbooks/i });
    expect(within(pending).getByRole("heading", { level: 2 })).toHaveTextContent("To enter1");
    expect(within(completed).getByRole("heading", { level: 2 })).toHaveTextContent("Entered in QuickBooks1");
    expect(screen.queryByRole("link", { name: "Other.pdf" })).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Remove filter Search: lion" }));
    expect(await screen.findByText("4 of 4")).toBeInTheDocument();
    expect(window.location.search).toBe("?campaign=lab&campaign=invoice");
    expect(window.location.hash).toBe("#pending");
  });

  it("keeps spaces while typing and offers a clear action in both filtered empty sections", async () => {
    renderPage([scan({}), scan({ id: "done", enteredAt: "2026-09-03T12:00:00Z" })]);
    await screen.findByText("2 of 2");
    const user = userEvent.setup();
    const search = screen.getByRole("searchbox", { name: "Search documents" });
    await user.type(search, "Lion plumbing");
    expect(search).toHaveValue("Lion plumbing");
    expect(new URLSearchParams(window.location.search).get("q")).toBe("Lion plumbing");
    expect(screen.getByText("2 of 2")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "Record type" }), "transaction");
    expect(await screen.findByText("0 of 2")).toBeInTheDocument();
    const pending = screen.getByRole("region", { name: /to enter/i });
    const completed = screen.getByRole("region", { name: /entered in quickbooks/i });
    expect(within(pending).getByText("No documents match these filters")).toBeInTheDocument();
    expect(within(completed).getByText("No documents match these filters")).toBeInTheDocument();
    await user.click(within(completed).getByRole("button", { name: "Clear filters" }));
    expect(await screen.findByText("2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search documents" })).toHaveValue("");
    expect(window.location.search).toBe("");
  });

  it("explains the invoice date and announces reversed range errors", async () => {
    renderPage([scan({})], "?from=2026-09-03&to=2026-09-01&min=20&max=10");
    await screen.findByText("0 of 1");
    expect(screen.getByLabelText("Invoice date from")).toHaveAccessibleDescription(/issue date.*creation date.*local/i);
    expect(screen.getByLabelText("Invoice date from")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Invoice date to")).toHaveAccessibleDescription(/on or after/i);
    expect(screen.getByLabelText("Minimum amount")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Maximum amount")).toHaveAccessibleDescription(/at least/i);
    expect(screen.getAllByRole("alert")).toHaveLength(2);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Remove filter Invoice date from: 2026-09-03" }));
    await user.click(screen.getByRole("button", { name: "Remove filter Minimum amount: 20" }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });

  it("accepts decimal and negative amount drafts without dropping existing criteria", async () => {
    renderPage([scan({})], "?status=needs_review&campaign=lab");
    await screen.findByText("1 of 1");
    const user = userEvent.setup();
    const minimum = screen.getByLabelText("Minimum amount");
    await user.type(minimum, "10.50");
    expect(minimum).toHaveValue("10.50");
    expect(new URLSearchParams(window.location.search).get("min")).toBe("10.5");
    await user.clear(minimum);
    await user.type(minimum, "-1.05");
    expect(minimum).toHaveValue("-1.05");
    expect(new URLSearchParams(window.location.search).get("min")).toBe("-1.05");
    expect(new URLSearchParams(window.location.search).get("status")).toBe("needs_review");
    expect(new URLSearchParams(window.location.search).get("campaign")).toBe("lab");

    await user.clear(minimum);
    await user.type(minimum, "-");
    expect(minimum).toHaveValue("-");
    await user.tab();
    expect(minimum).toHaveValue("");
    expect(new URLSearchParams(window.location.search).has("min")).toBe(false);
  });

  it("announces unavailable results without claiming filters matched an empty dataset", async () => {
    renderPage([], "?status=needs_review", new Error("unreachable"));
    expect(await screen.findByText("Results unavailable")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.queryByText("No documents match these filters")).not.toBeInTheDocument();
    expect(screen.queryByText("0 of 0")).not.toBeInTheDocument();
  });
});
