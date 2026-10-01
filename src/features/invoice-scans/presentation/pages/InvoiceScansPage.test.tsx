import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { InvoiceScan } from "../../domain/models";

const api = vi.hoisted(() => ({
  listInvoiceScans: vi.fn(),
  updateInvoiceScan: vi.fn(),
  deleteInvoiceScan: vi.fn(),
  createManualInvoiceTransaction: vi.fn(),
  attachInvoiceScanFile: vi.fn(),
  getInvoiceScanDownloadUrl: vi.fn(),
}));
vi.mock("../../infra/invoiceScansApi", () => ({
  listInvoiceScans: api.listInvoiceScans,
  updateInvoiceScan: api.updateInvoiceScan,
  deleteInvoiceScan: api.deleteInvoiceScan,
  attachInvoiceScanFile: api.attachInvoiceScanFile,
  getInvoiceScanDownloadUrl: api.getInvoiceScanDownloadUrl,
  getInvoiceScan: vi.fn(),
  retryInvoiceScan: vi.fn(),
  listProjectsForPicker: vi.fn().mockResolvedValue([]),
  createManualInvoiceTransaction: api.createManualInvoiceTransaction,
  uploadAndScanInvoice: vi.fn(),
}));
vi.mock("@/shared/presentation/toast", () => ({
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
}));

const routerPush = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush, replace: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
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
    updatedBy: null,
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

  it("shows the project as an editable control and the last editor by name", async () => {
    api.listInvoiceScans.mockResolvedValue([scan({ id: "pending", projectNumber: "050P-0826", updatedBy: 7 })]);
    renderPage();

    expect((await screen.findAllByRole("button", { name: "Project of s.pdf" }))[0]).toHaveTextContent("050P-0826");
    expect(screen.getAllByText("Ana Perez").length).toBeGreaterThan(0);
  });

  it("disables the checkbox for scans without details", async () => {
    api.listInvoiceScans.mockResolvedValue([scan({ id: "failed", status: "failed" })]);
    renderPage();
    const box = (await screen.findAllByRole("checkbox", { name: "Entered in QuickBooks" }))[0];
    expect(box).toBeDisabled();
  });

  it("titles the screen 'Document scans'", async () => {
    api.listInvoiceScans.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByRole("heading", { name: "Document scans" })).toBeInTheDocument();
  });

  it("offers both ways to add a transaction inside one dialog", async () => {
    api.listInvoiceScans.mockResolvedValue([]);
    renderPage();

    const user = userEvent.setup();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(await screen.findByRole("button", { name: /new transaction/i }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "New transaction" })).toBeInTheDocument();
    expect(within(dialog).getByLabelText("What was the payment for?")).toBeInTheDocument();
    // El adjunto está en la misma ventana y no es obligatorio.
    expect(
      within(dialog).getByRole("button", { name: /attach invoice or receipt/i }),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("tab", { name: /scan document/i }));
    expect(within(dialog).getByRole("button", { name: /take photo/i })).toBeInTheDocument();

    await user.click(within(dialog).getByRole("tab", { name: /add transaction/i }));
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("saves a transaction with no document attached", async () => {
    api.listInvoiceScans.mockResolvedValue([]);
    api.createManualInvoiceTransaction.mockResolvedValue(scan({ id: "created" }));
    renderPage();

    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /new transaction/i }));
    const dialog = await screen.findByRole("dialog");

    await user.type(within(dialog).getByLabelText("What was the payment for?"), "Materials");
    await user.type(within(dialog).getByLabelText("Amount"), "69.60");
    await user.click(within(dialog).getByRole("radio", { name: /payment made/i }));
    await user.click(within(dialog).getByRole("button", { name: "Add transaction" }));

    await waitFor(() => expect(api.createManualInvoiceTransaction).toHaveBeenCalled());
    expect(api.createManualInvoiceTransaction.mock.calls[0][0]).toMatchObject({
      description: "Materials",
      direction: "payment_made",
      amount: 69.6,
      currency: "USD",
      projectNumber: null,
    });
    expect(api.attachInvoiceScanFile).not.toHaveBeenCalled();
  });

  it("asks for a payment direction instead of doing nothing", async () => {
    api.createManualInvoiceTransaction.mockClear();
    api.listInvoiceScans.mockResolvedValue([]);
    renderPage();

    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /new transaction/i }));
    const dialog = await screen.findByRole("dialog");

    await user.type(within(dialog).getByLabelText("What was the payment for?"), "Materials");
    await user.type(within(dialog).getByLabelText("Amount"), "10");
    await user.click(within(dialog).getByRole("button", { name: "Add transaction" }));

    expect(
      await within(dialog).findByText(/choose whether the money went out or came in/i),
    ).toBeInTheDocument();
    expect(api.createManualInvoiceTransaction).not.toHaveBeenCalled();
  });

  it("corrects the amount of a row in place", async () => {
    const pending = scan({
      id: "pending",
      recordType: "transaction",
      extractedData: {
        direction: "unknown",
        classification: "other",
        counterpartyName: "Lion Plumbing",
        invoiceNumber: null,
        issueDate: "2026-09-28",
        dueDate: null,
        currency: "USD",
        subtotal: 69.6,
        taxTotal: null,
        total: 69.6,
        paymentStatus: "paid",
        description: "Materials",
        transactionDirection: "payment_made",
        confidence: 1,
        lineItems: [],
      },
    });
    api.updateInvoiceScan.mockResolvedValue(pending);
    api.listInvoiceScans.mockResolvedValue([pending]);
    renderPage();

    const user = userEvent.setup();
    const amount = (await screen.findAllByLabelText("Amount of s.pdf"))[0];
    expect(amount).toHaveValue("69.6");
    await user.clear(amount);
    await user.type(amount, "870.40");
    await user.tab();

    expect(api.updateInvoiceScan).toHaveBeenCalledWith("pending", {
      total: 870.4,
      subtotal: 870.4,
    });
  });

  it("deletes a transaction after confirming", async () => {
    api.listInvoiceScans.mockResolvedValue([scan({ id: "pending" })]);
    api.deleteInvoiceScan.mockResolvedValue(undefined);
    renderPage();

    const user = userEvent.setup();
    await user.click((await screen.findAllByRole("button", { name: /^delete /i }))[0]);
    const confirm = await screen.findByRole("alertdialog");
    await user.click(within(confirm).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(api.deleteInvoiceScan).toHaveBeenCalledWith("pending"));
  });
});
