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
  notifyError: vi.fn(),
  listQboCounterparties: vi.fn().mockResolvedValue([]),
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
  listQboCounterparties: api.listQboCounterparties,
  createQboCounterparty: vi.fn(),
  createManualInvoiceTransaction: api.createManualInvoiceTransaction,
  uploadAndScanInvoice: vi.fn(),
}));
vi.mock("@/shared/presentation/toast", () => ({
  notifyError: api.notifyError,
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
    // El último editor ya no tiene columna propia: acompaña a la fecha.
    expect(screen.getAllByText(/Ana Perez/).length).toBeGreaterThan(0);
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

  it("keeps the manual transaction form open and reports an API failure", async () => {
    api.listInvoiceScans.mockResolvedValue([]);
    api.createManualInvoiceTransaction.mockRejectedValue(new Error("network down"));
    api.notifyError.mockClear();
    renderPage();

    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /new transaction/i }));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("What was the payment for?"), "Materials");
    await user.type(within(dialog).getByLabelText("Amount"), "69.60");
    await user.click(within(dialog).getByRole("radio", { name: /payment made/i }));
    await user.click(within(dialog).getByRole("button", { name: "Add transaction" }));

    await waitFor(() => expect(api.createManualInvoiceTransaction).toHaveBeenCalled());
    expect(await within(dialog).findByRole("button", { name: "Add transaction" })).toBeEnabled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(api.notifyError).toHaveBeenCalledWith(
      expect.any(Error),
      "The transaction could not be added.",
    );
  });

  it("sends the QuickBooks id of a counterparty picked from the list", async () => {
    // cmdk mide su lista y jsdom no trae ResizeObserver.
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
    api.createManualInvoiceTransaction.mockClear();
    api.listInvoiceScans.mockResolvedValue([]);
    api.listQboCounterparties.mockResolvedValue([
      { id: "58", name: "Home Depot", type: "Vendor" },
    ]);
    api.createManualInvoiceTransaction.mockResolvedValue(scan({ id: "created" }));
    renderPage();

    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /new transaction/i }));
    const dialog = await screen.findByRole("dialog");

    await user.type(within(dialog).getByLabelText("What was the payment for?"), "Materials");
    await user.type(within(dialog).getByLabelText("Amount"), "69.60");
    await user.click(within(dialog).getByRole("radio", { name: /payment made/i }));
    await user.click(within(dialog).getByLabelText("Paid to / received from"));
    await user.click(await within(dialog).findByText("Home Depot"));
    await user.click(within(dialog).getByRole("button", { name: "Add transaction" }));

    await waitFor(() => expect(api.createManualInvoiceTransaction).toHaveBeenCalled());
    expect(api.createManualInvoiceTransaction.mock.calls[0][0]).toMatchObject({
      counterpartyName: "Home Depot",
      counterpartyId: "58",
      counterpartyType: "Vendor",
    });
    api.listQboCounterparties.mockResolvedValue([]);
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

  describe("the counterparty column", () => {
    function withCounterparty(
      overrides: Partial<InvoiceScan["extractedData"] & object>,
    ): InvoiceScan {
      return scan({
        id: "pending",
        recordType: "transaction",
        extractedData: {
          direction: "unknown",
          classification: "other",
          counterpartyName: "Home Depot",
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
          ...overrides,
        },
      });
    }

    it("says 'Paid to' when the money went out", async () => {
      api.listInvoiceScans.mockResolvedValue([withCounterparty({})]);
      renderPage();

      expect((await screen.findAllByTitle("Paid to: Home Depot")).length).toBeGreaterThan(0);
    });

    it("says 'Received from' when the money came in", async () => {
      api.listInvoiceScans.mockResolvedValue([
        withCounterparty({
          transactionDirection: "payment_received",
          counterpartyName: "Anderson Family",
        }),
      ]);
      renderPage();

      expect(
        (await screen.findAllByTitle("Received from: Anderson Family")).length,
      ).toBeGreaterThan(0);
    });

    // Un documento escaneado no tiene `transactionDirection`: la factura de un
    // proveedor (`incoming`) es dinero que sale.
    it("reads the direction off a scanned supplier bill", async () => {
      api.listInvoiceScans.mockResolvedValue([
        withCounterparty({ direction: "incoming", transactionDirection: undefined }),
      ]);
      renderPage();

      expect((await screen.findAllByTitle("Paid to: Home Depot")).length).toBeGreaterThan(0);
    });

    it("reads the direction off a scanned customer invoice", async () => {
      api.listInvoiceScans.mockResolvedValue([
        withCounterparty({
          direction: "outgoing",
          transactionDirection: undefined,
          counterpartyName: "Anderson Family",
        }),
      ]);
      renderPage();

      expect(
        (await screen.findAllByTitle("Received from: Anderson Family")).length,
      ).toBeGreaterThan(0);
    });

    it("truncates a very long name but keeps it whole in the tooltip", async () => {
      const long =
        "Southern Atlantic Industrial Roofing & Waterproofing Contractors of Greater Miami, LLC";
      api.listInvoiceScans.mockResolvedValue([withCounterparty({ counterpartyName: long })]);
      renderPage();

      const cell = (await screen.findAllByTitle(`Paid to: ${long}`))[0];
      expect(within(cell).getByText(long)).toHaveClass("truncate");
    });

    it("shows a dash for a row with no counterparty", async () => {
      api.listInvoiceScans.mockResolvedValue([withCounterparty({ counterpartyName: null })]);
      renderPage();

      await screen.findAllByRole("checkbox", { name: "Entered in QuickBooks" });
      expect(screen.queryByTitle(/^Paid to:/)).not.toBeInTheDocument();
      expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    });
  });

  it("deletes a transaction after confirming", async () => {
    api.listInvoiceScans.mockResolvedValue([scan({ id: "pending" })]);
    api.deleteInvoiceScan.mockResolvedValue(undefined);
    renderPage();

    const user = userEvent.setup();
    await user.click((await screen.findAllByRole("button", { name: /^actions for /i }))[0]);
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));
    const confirm = await screen.findByRole("alertdialog");
    await user.click(within(confirm).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(api.deleteInvoiceScan).toHaveBeenCalledWith("pending"));
  });
});
