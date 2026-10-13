import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, vi } from "vitest";

import type { ExtractedInvoiceData, InvoiceScan } from "../../domain/models";

const api = vi.hoisted(() => ({ listInvoiceScans: vi.fn(), getInvoiceScan: vi.fn() }));
const filterNavigation = vi.hoisted(() => ({
  query: "",
  deferNotifications: false,
  listeners: new Set<() => void>(),
}));

vi.mock("../../infra/invoiceScansApi", () => ({
  listInvoiceScans: api.listInvoiceScans,
  getInvoiceScan: api.getInvoiceScan,
  retryInvoiceScan: vi.fn(),
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
          const onPopState = () => {
            filterNavigation.query = window.location.search;
            onChange();
          };
          filterNavigation.listeners.add(onChange);
          window.addEventListener("popstate", onPopState);
          return () => {
            filterNavigation.listeners.delete(onChange);
            window.removeEventListener("popstate", onPopState);
          };
        },
        () => filterNavigation.query,
      );
      return new URLSearchParams(query);
    },
  };
});

import { InvoiceScansPage } from "./InvoiceScansPage";

export async function chooseFilterOption(user: UserEvent, label: string, option: string) {
  await user.click(screen.getByRole("combobox", { name: label }));
  await user.click(within(screen.getByRole("dialog", { name: label })).getByRole("button", { name: `Apply filter ${label}: ${option}` }));
}

export function flushFilterNavigation() {
  filterNavigation.deferNotifications = false;
  filterNavigation.query = window.location.search;
  for (const listener of filterNavigation.listeners) listener();
}

export function deferFilterNavigation() {
  filterNavigation.deferNotifications = true;
}

export function rejectNextListRequest() {
  api.listInvoiceScans.mockRejectedValueOnce(new Error("lab-only refetch failure"));
}

beforeEach(() => {
  window.history.replaceState(null, "", "/finance/invoices");
  filterNavigation.query = "";
  filterNavigation.deferNotifications = false;
  const replaceState = window.history.replaceState.bind(window.history);
  // Next integrates native history updates; tests can defer its query propagation.
  vi.spyOn(window.history, "replaceState").mockImplementation((data, unused, url) => {
    replaceState(data, unused, url);
    if (!filterNavigation.deferNotifications) flushFilterNavigation();
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

export function scan(overrides: Partial<InvoiceScan>): InvoiceScan {
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

export function renderPage(scans: InvoiceScan[], query = "", error?: Error, view: ReactNode = <InvoiceScansPage />) {
  window.history.replaceState(null, "", `/finance/invoices${query}`);
  api.listInvoiceScans.mockImplementation(() => error ? Promise.reject(error) : Promise.resolve(scans));
  api.getInvoiceScan.mockImplementation((id: string) => Promise.resolve(scans.find((scan) => scan.id === id)));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const page = render(
    <QueryClientProvider client={client}>
      {view}
    </QueryClientProvider>,
  );
  return { ...page, client };
}

function invoiceData(overrides: Partial<ExtractedInvoiceData>): ExtractedInvoiceData {
  return {
    direction: "outgoing", classification: "customer_service", counterpartyName: "Café Anderson",
    invoiceNumber: "INV-1042", issueDate: "2026-09-10", dueDate: null, currency: "USD",
    subtotal: 100.5, taxTotal: null, total: 100.5, paymentStatus: "unpaid", confidence: 1,
    lineItems: [], ...overrides,
  };
}

export const FILTER_RECORD_TITLES = [
  "Invoice INV-1042", "Invoice BILL-2002", "Customer deposit", "Roof crew refund", "Unclassified.pdf",
];

export function filterFixtureScans(): InvoiceScan[] {
  const records = [
    scan({ id: "customer", recordType: "invoice", fileName: "Anderson-contract.pdf",
      projectNumber: "050P-0826", comments: "Permit approved", extractedData: invoiceData({}) }),
    scan({ id: "supplier", recordType: "invoice", status: "failed", fileName: "Supplier.pdf",
      extractedData: invoiceData({ direction: "incoming", classification: "materials_expense",
        counterpartyName: "Lion Plumbing", invoiceNumber: "BILL-2002", total: 250, issueDate: "2026-09-12" }) }),
    scan({ id: "deposit", recordType: "transaction", status: "uploaded", fileName: "Deposit.pdf",
      extractedData: invoiceData({ direction: "unknown", transactionDirection: "payment_received",
        classification: "other", description: "Customer deposit", invoiceNumber: null,
        counterpartyName: "Baker Family", total: 0, issueDate: "2026-09-15" }) }),
    scan({ id: "refund", recordType: "transaction", status: "processing", fileName: "Refund.pdf",
      extractedData: invoiceData({ direction: "unknown", transactionDirection: "payment_made",
        classification: "subcontractor_expense", description: "Roof crew refund", invoiceNumber: null,
        counterpartyName: "Roofline Crew", total: -25, issueDate: "2026-09-20" }) }),
    scan({ id: "unclassified", fileName: "Unclassified.pdf",
      extractedData: invoiceData({ direction: "unknown", classification: "unknown", invoiceNumber: null,
        counterpartyName: null, issueDate: null, total: null }) }),
  ];
  return records.flatMap((record) => [
    record,
    { ...record, id: `${record.id}-entered`, enteredAt: "2026-09-22T12:00:00Z" },
  ]);
}
