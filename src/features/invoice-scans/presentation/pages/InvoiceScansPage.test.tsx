import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { InvoiceScan } from "../../domain/models";

const api = vi.hoisted(() => ({
  listInvoiceScans: vi.fn(),
  updateInvoiceScan: vi.fn(),
}));
vi.mock("../../infra/invoiceScansApi", () => ({
  listInvoiceScans: api.listInvoiceScans,
  updateInvoiceScan: api.updateInvoiceScan,
  getInvoiceScan: vi.fn(),
  retryInvoiceScan: vi.fn(),
  listProjectsForPicker: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/shared/presentation/toast", () => ({
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
}));

vi.mock("@/features/users/presentation/hooks/data/useUserDirectory", () => ({
  useUserDirectory: () => ({
    users: [{ id: 7, name: "Ana Perez", email: "ana@example.com", picture: null }],
    isLoading: false,
  }),
}));

import { InvoiceScansPage } from "./InvoiceScansPage";

afterEach(cleanup);

function scan(overrides: Partial<InvoiceScan>): InvoiceScan {
  return {
    id: "s",
    fileName: "s.pdf",
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

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <InvoiceScansPage />
    </QueryClientProvider>,
  );
}

describe("InvoiceScansPage", () => {
  it("splits scans into 'to enter' and 'entered' and lets the reviewer tick one", async () => {
    const pending = scan({
      id: "pending",
      projectNumber: "050P-0826",
      warnings: ["Total could not be read"],
      extractedData: {
        direction: "incoming",
        classification: "materials_expense",
        counterpartyName: "Lion Plumbing",
        invoiceNumber: "4022039",
        issueDate: null,
        dueDate: null,
        currency: "USD",
        subtotal: null,
        taxTotal: null,
        total: 87.73,
        paymentStatus: "unpaid",
        confidence: 0.9,
        lineItems: [],
      },
    });
    const done = scan({ id: "done", fileName: "done.pdf", enteredAt: "2026-09-10T00:00:00Z" });
    api.listInvoiceScans.mockResolvedValue([done, pending]);
    api.updateInvoiceScan.mockResolvedValue({ ...pending, enteredAt: "2026-09-22T00:00:00Z" });

    renderPage();

    const links = await screen.findAllByRole("link", { name: "Invoice 4022039" });
    expect(links[0]).toHaveAttribute("href", "/finance/invoices/pending");
    const pendingSection = screen.getByRole("region", { name: /to enter/i });
    expect(within(pendingSection).getAllByRole("link", { name: "Invoice 4022039" }).length).toBeGreaterThan(0);
    expect(within(pendingSection).getAllByText("050P-0826").length).toBeGreaterThan(0);
    expect(within(pendingSection).getAllByLabelText("1 thing to check").length).toBeGreaterThan(0);

    const completedSection = screen.getByRole("region", { name: /entered in quickbooks/i });
    expect(within(completedSection).getAllByRole("link", { name: "done.pdf" }).length).toBeGreaterThan(0);

    const user = userEvent.setup();
    await user.click(within(pendingSection).getAllByRole("checkbox", { name: "Entered in QuickBooks" })[0]);
    expect(api.updateInvoiceScan).toHaveBeenCalledWith("pending", { entered: true });
  });

  it("edits the comments of a row and saves them when the field loses focus", async () => {
    const pending = scan({ id: "pending", comments: "Missing PO" });
    api.listInvoiceScans.mockResolvedValue([pending]);
    api.updateInvoiceScan.mockResolvedValue({ ...pending, comments: "PO received" });
    renderPage();

    const user = userEvent.setup();
    const field = (await screen.findAllByLabelText("Comments on s.pdf"))[0];
    expect(field).toHaveValue("Missing PO");
    await user.clear(field);
    await user.type(field, "PO received");
    await user.tab();

    expect(api.updateInvoiceScan).toHaveBeenCalledWith("pending", { comments: "PO received" });
  });

  it("does not save comments that were not changed", async () => {
    api.updateInvoiceScan.mockClear();
    api.listInvoiceScans.mockResolvedValue([scan({ id: "pending", comments: "Same" })]);
    renderPage();

    const user = userEvent.setup();
    const field = (await screen.findAllByLabelText("Comments on s.pdf"))[0];
    await user.click(field);
    await user.tab();

    expect(api.updateInvoiceScan).not.toHaveBeenCalled();
  });

  it("shows the assigned user and the project number as editable controls", async () => {
    api.listInvoiceScans.mockResolvedValue([scan({ id: "pending", projectNumber: "050P-0826", enteredBy: 7 })]);
    renderPage();

    expect((await screen.findAllByRole("button", { name: "Project of s.pdf" }))[0]).toHaveTextContent("050P-0826");
    expect(screen.getAllByRole("combobox", { name: "User of s.pdf" })[0]).toHaveTextContent("Ana Perez");
  });

  it("disables the checkbox for scans without details", async () => {
    api.listInvoiceScans.mockResolvedValue([scan({ id: "failed", status: "failed" })]);
    renderPage();
    const box = (await screen.findAllByRole("checkbox", { name: "Entered in QuickBooks" }))[0];
    expect(box).toBeDisabled();
  });
});
